import { useState, useCallback } from 'react';

export const useSpeechToText = (onTextReceived: (text: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type directly.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN'; // Works for numbers and English/Hindi phrases

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTextReceived(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error', event.error);
        setIsListening(false);
        setSpeechError('Microphone error. Please try again.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition exception:', err);
      setIsListening(false);
    }
  }, [onTextReceived]);

  return { isListening, startListening, speechError };
};
