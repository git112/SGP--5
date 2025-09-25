import { useState, useRef, useCallback, useEffect } from 'react';

interface UseSpeechRecognitionReturn {
  text: string;
  isListening: boolean;
  error: string;
  hasRecognitionSupport: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetText: () => void;
  setText: (text: string) => void;
}

// Extend the global Window interface to include webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
  
  interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
  }
  
  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
  }
  
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  }
  
  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }
  
  interface SpeechRecognitionResult {
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
    readonly isFinal: boolean;
  }
  
  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }
  
  var SpeechRecognition: {
    prototype: SpeechRecognition;
    new(): SpeechRecognition;
  };
  
  var webkitSpeechRecognition: {
    prototype: SpeechRecognition;
    new(): SpeechRecognition;
  };
}

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [text, setText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [hasRecognitionSupport, setHasRecognitionSupport] = useState<boolean>(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef<string>('');
  const lastEventVersionRef = useRef<number>(0);

  // Check for browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setHasRecognitionSupport(!!SpeechRecognition);
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      
      // Configure recognition settings
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognitionRef.current = recognition;

      // Handle recognition results
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        // Bump an event version so consumers can detect deltas reliably
        lastEventVersionRef.current += 1;
        let interimTranscript = '';
        let finalTranscript = '';

        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Update the text with final transcript + interim transcript
        const newText = finalTranscriptRef.current + finalTranscript + interimTranscript;
        setText(newText);
        
        // Store final transcript for next iteration
        if (finalTranscript) {
          finalTranscriptRef.current += finalTranscript;
        }
      };

      // Handle recognition errors
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        
        let errorMessage = '';
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone access denied or not available.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error occurred. Please check your connection.';
            break;
          case 'aborted':
            errorMessage = 'Speech recognition was aborted.';
            break;
          case 'language-not-supported':
            errorMessage = 'Language not supported.';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        
        setError(errorMessage);
        setIsListening(false);
      };

      // Handle recognition end
      recognition.onend = () => {
        setIsListening(false);
      };

      // Handle recognition start
      recognition.onstart = () => {
        setError('');
        setIsListening(true);
      };
    }
  }, []);

  const startListening = useCallback(async () => {
    if (!recognitionRef.current || !hasRecognitionSupport) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      return;
    }

    try {
      // Request microphone permission
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      
      setError('');
      // Preserve existing text but ensure we don't duplicate previously reported interim
      // Consumers should rely on cumulative text and compute deltas on their side
      // Reset event version per new session
      lastEventVersionRef.current = 0;
      finalTranscriptRef.current = text;
      recognitionRef.current.start();
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setError('Failed to access microphone. Please check your permissions.');
    }
  }, [hasRecognitionSupport, isListening, text]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const resetText = useCallback(() => {
    setText('');
    finalTranscriptRef.current = '';
    lastEventVersionRef.current = 0;
  }, []);

  return {
    text,
    isListening,
    error,
    hasRecognitionSupport,
    startListening,
    stopListening,
    resetText,
    setText,
  };
};
