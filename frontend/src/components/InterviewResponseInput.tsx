import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Trash2, AlertCircle } from 'lucide-react';
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
  onChange,
  placeholder = "Type your answer here... (minimum 10 characters)",
  minLength = 10,
  className = '',
  disabled = false,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const lastSpeechRef = React.useRef('');
  
  const {
    text: speechText,
    isListening,
    error,
    hasRecognitionSupport,
    startListening,
    stopListening,
    resetText,
  } = useSpeechRecognition();

  // Update local value when speech text changes
  React.useEffect(() => {
    if (!speechText) return;

    // Append only the new delta since last onresult
    const previous = lastSpeechRef.current;
    const delta = speechText.startsWith(previous)
      ? speechText.slice(previous.length)
      : speechText; // fallback if pointers desync

    if (!delta) return;

    setLocalValue((prev) => {
      const newValue = prev + delta;
      onChange?.(newValue);
      return newValue;
    });

    // advance the pointer to current cumulative speechText
    lastSpeechRef.current = speechText;
  }, [speechText, onChange]);

  // Update local value when prop value changes
  React.useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value);
    }
  }, [value, localValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      // reset speech buffers so we don't duplicate previously captured text
      lastSpeechRef.current = '';
      resetText();
      startListening();
    }
  };

  const handleClear = () => {
    setLocalValue('');
    resetText();
    lastSpeechRef.current = '';
    onChange?.('');
  };

  const isValid = localValue.length >= minLength;

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
            value={localValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={`min-h-[120px] resize-none ${
              isListening ? 'ring-2 ring-blue-500/50 bg-blue-50/50 pr-20' : 'pr-4'
            } ${
              !isValid && localValue.length > 0 ? 'border-orange-500/50' : ''
            }`}
            disabled={disabled}
          />
          
          {/* Listening Indicator */}
          {isListening && (
            <div className="absolute top-3 right-3 flex items-center gap-2 bg-blue-500/10 px-2 py-1 rounded-full border border-blue-500/20">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-xs text-blue-600 font-medium ml-1">Listening</span>
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
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'hover:bg-blue-50'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  Start Recording
                </>
              )}
            </Button>

            {/* Clear Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={disabled || localValue.length === 0}
              className="text-gray-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Character Count and Validation */}
          <div className="flex items-center gap-3">
            {!isValid && localValue.length > 0 && (
              <Badge variant="outline" className="border-orange-500 text-orange-600">
                {minLength - localValue.length} more characters needed
              </Badge>
            )}
            {isValid && (
              <Badge variant="outline" className="border-green-500 text-green-600">
                ✓ Valid response
              </Badge>
            )}
            <span className="text-sm text-gray-500">
              {localValue.length}/{minLength}
            </span>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Click "Start Recording" to use voice-to-text</p>
          <p>• Speak clearly and pause between sentences</p>
          <p>• Click "Stop Recording" when finished</p>
          <p>• You can also type directly in the text area</p>
        </div>
      </div>
    </div>
  );
};
