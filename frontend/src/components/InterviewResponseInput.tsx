import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Trash2, AlertCircle, Loader2, CheckCircle, XCircle } from 'lucide-react'; // Added missing icons
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface InterviewResponseInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  minLength?: number;
  className?: string;
  disabled?: boolean;
}

export const InterviewResponseInput: React.FC<InterviewResponseInputProps> = ({
  value = '',
  onChange = () => {}, // Provide a default empty function
  placeholder = "Type your answer here... (minimum 10 characters)",
  minLength = 10,
  className = '',
  disabled = false,
}) => {
  
  // --- FIX: REMOVED localValue and lastSpeechRef ---
  // const [localValue, setLocalValue] = useState(value); // REMOVED
  // const lastSpeechRef = React.useRef(''); // REMOVED

  const {
    text: speechText,
    isListening,
    error,
    hasRecognitionSupport,
    startListening,
    stopListening,
    resetText,
    setText: setHookText, // We need the hook's setter
  } = useSpeechRecognition();

  // --- FIX #1: Sync from Parent Prop -> Hook ---
  // When the parent 'value' prop changes (e.g., user clicks "Next" or "Previous"),
  // we must update the hook's internal text state.
  useEffect(() => {
    // Only update if the parent's value is different and we're not listening
    // This prevents speech from being overwritten by a stale prop
    if (value !== speechText && !isListening) {
      setHookText(value);
    }
  }, [value, speechText, isListening, setHookText]);

  // --- FIX #2: Sync from Hook -> Parent Prop ---
  // When the hook provides new speech text, call the parent's `onChange`.
  // The hook's 'speechText' is ALREADY cumulative and correct.
  useEffect(() => {
    // Only send updates *while listening* to prevent stale updates
    if (isListening) {
      onChange(speechText);
    }
  }, [speechText, isListening, onChange]);

  // --- FIX #3: Handle Manual Typing ---
  // When the user types, update the parent AND the hook.
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue); // Update parent
    setHookText(newValue); // Keep hook in sync
  };

  // --- FIX #4: Handle Mic Toggle ---
  // Tell the hook what text to start with.
  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      // INSTEAD of resetText(), tell the hook what text we already have.
      setHookText(value); 
      startListening();
    }
  };

  // --- FIX #5: Handle Clear ---
  // Clear both the parent's state (via onChange) and the hook's state.
  const handleClear = () => {
    stopListening(); // Stop any active recording
    onChange('');
    resetText();
  };

  // Use 'value' prop directly. The component is now controlled.
  const isValid = value.length >= minLength;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Browser Support Warning */}
      {!hasRecognitionSupport && (
        <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
          <p className="text-sm text-yellow-600">
            Voice-to-text is not supported in this browser. Please use a modern browser like Chrome, Edge, or Safari.
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Input Area */}
      <div className="space-y-3">
        {/* Textarea */}
        <div className="relative">
          <Textarea
            value={value} // Use 'value' prop directly
            onChange={handleInputChange}
            placeholder={placeholder}
            className={`min-h-[120px] resize-none ${
              isListening ? 'ring-2 ring-blue-500/50 bg-blue-900/10 pr-20' : 'pr-4' // Dark mode listening bg
            } ${
              !isValid && value.length > 0 ? 'border-orange-500/50' : ''
            } bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400`} // Added dark mode styles
            disabled={disabled}
          />
          
          {/* Listening Indicator */}
          {isListening && (
            <div className="absolute top-3 right-3 flex items-center gap-2 bg-blue-500/10 px-2 py-1 rounded-full border border-blue-500/20">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-xs text-blue-400 font-medium ml-1">Listening</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Voice-to-Text Button */}
            <Button
              type="button"
              variant={isListening ? "destructive" : "outline"}
              size="sm"
              onClick={handleMicToggle}
              disabled={!hasRecognitionSupport || disabled}
              className={`flex items-center gap-2 ${
                isListening 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              {isListening ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> {/* Added Loader */}
                  Stop
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  Record
                </>
              )}
            </Button>

            {/* Clear Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={disabled || value.length === 0}
              className="text-gray-500 hover:text-red-500 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>

          {/* Character Count and Validation */}
          <div className="flex items-center gap-3">
            {!isValid && value.length > 0 && (
              <Badge variant="outline" className="border-orange-500/50 text-orange-400">
                {minLength - value.length} more needed
              </Badge>
            )}
            {isValid && (
              <Badge variant="outline" className="border-green-500/50 text-green-400">
                <CheckCircle className="w-3 h-3 mr-1" />
                Valid
              </Badge>
            )}
            <span className="text-sm text-gray-400">
              {value.length}/{minLength}
            </span>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1 pt-2">
          <p>• Click "Record" to use voice-to-text.</p>
          <p>• Click "Stop" when finished.</p>
          <p>• You can also type directly in the text area.</p>
        </div>
      </div>
    </div>
  );
};