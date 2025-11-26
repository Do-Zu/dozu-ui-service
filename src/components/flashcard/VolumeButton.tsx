'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VolumeButtonProps {
    text: string;
    className?: string;
    onSpeakingChange?: (isSpeaking: boolean) => void;
}

export default function VolumeButton({ text, className, onSpeakingChange }: VolumeButtonProps) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Function to detect language based on Vietnamese accented characters
    function detectLanguage(text: string): string {
        // Regex to detect Vietnamese accented characters
        const vietnamesePattern = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ]/i;

        if (vietnamesePattern.test(text)) {
            return 'vi-VN';
        }
        return 'en-US';
    }

    // Helper function to stop current utterance and clear handlers
    const stopCurrentUtterance = useCallback(() => {
        if (!('speechSynthesis' in window)) {
            return;
        }

        const utterance = speechSynthesisRef.current;
        if (utterance) {
            // Clear all handlers before canceling to prevent callbacks from firing after cancel
            utterance.onstart = null;
            utterance.onend = null;
            utterance.onerror = null;
            
            // Cancel speech synthesis
            window.speechSynthesis.cancel();
            
            // Update state only once from component logic
            setIsSpeaking(false);
            onSpeakingChange?.(false);
            
            // Clear reference
            speechSynthesisRef.current = null;
        }
    }, [onSpeakingChange]);

    function handleTextToSpeech() {
        // Stop current speech if playing
        if (isSpeaking && speechSynthesisRef.current) {
            stopCurrentUtterance();
            return;
        }

        // Get text to speak
        const textToSpeak = text || '';

        if (!textToSpeak.trim()) {
            return;
        }

        // Check if browser supports Web Speech API
        if ('speechSynthesis' in window) {
            // Create new utterance
            const utterance = new SpeechSynthesisUtterance(textToSpeak);

            // Auto-detect and configure language
            const detectedLang = detectLanguage(textToSpeak);
            utterance.lang = detectedLang;
            utterance.rate = 1; // Speech rate (0.1 - 10)
            utterance.pitch = 1; // Voice pitch (0 - 2)
            utterance.volume = 1; // Volume (0 - 1)

            // Handle when speech starts
            utterance.onstart = () => {
                setIsSpeaking(true);
                onSpeakingChange?.(true);
            };

            // Handle when speech ends
            utterance.onend = () => {
                // Only update state if utterance is still the current one (not cleared)
                if (speechSynthesisRef.current === utterance) {
                    setIsSpeaking(false);
                    onSpeakingChange?.(false);
                    speechSynthesisRef.current = null;
                }
            };

            // Handle errors
            utterance.onerror = (event) => {
                console.error('Text-to-speech error:', event);
                // Only update state if utterance is still the current one (not cleared)
                if (speechSynthesisRef.current === utterance) {
                    setIsSpeaking(false);
                    onSpeakingChange?.(false);
                    speechSynthesisRef.current = null;
                }
            };

            // Save reference to stop later
            speechSynthesisRef.current = utterance;

            // Start speaking
            window.speechSynthesis.speak(utterance);
        } else {
            console.warn('Text-to-speech is not supported in this browser');
        }
    }

    // Stop speech when text changes
    useEffect(() => {
        stopCurrentUtterance();
    }, [text, stopCurrentUtterance]);

    // Cleanup when component unmounts
    useEffect(() => {
        return () => {
            stopCurrentUtterance();
        };
    }, [stopCurrentUtterance]);

    return (
        <Button
            variant={isSpeaking ? 'default' : 'outline'}
            size="icon"
            className={cn('h-12 w-12 rounded-full', className)}
            onClick={handleTextToSpeech}
            title={isSpeaking ? 'Stop reading' : 'Read aloud'}
            aria-label={isSpeaking ? 'Stop reading' : 'Read aloud'}
        >
            {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
    );
}

