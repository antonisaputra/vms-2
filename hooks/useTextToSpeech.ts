import { useState, useCallback, useEffect } from 'react';

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  const speak = useCallback((text: string) => {
    if (!isEnabled || !window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Cancel any previous speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [isEnabled]);

  const cancel = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const toggleSpeech = useCallback(() => {
    setIsEnabled(prev => {
      if (prev) { // If it was enabled, now it's disabled
        cancel();
      }
      return !prev;
    });
  }, [cancel]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);


  return { isSpeaking, isEnabled, speak, cancel, toggleSpeech };
};
