'use client';

import React, { useEffect, useRef, useState } from 'react';
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

    // Hàm phát hiện ngôn ngữ dựa trên ký tự tiếng Việt có dấu
    function detectLanguage(text: string): string {
        // Regex để phát hiện ký tự tiếng Việt có dấu
        const vietnamesePattern = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ]/i;

        if (vietnamesePattern.test(text)) {
            return 'vi-VN';
        }
        return 'en-US';
    }

    function handleTextToSpeech() {
        // Dừng phát âm thanh hiện tại nếu đang phát
        if (isSpeaking && speechSynthesisRef.current) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            onSpeakingChange?.(false);
            return;
        }

        // Lấy text để đọc
        const textToSpeak = text || '';

        if (!textToSpeak.trim()) {
            return;
        }

        // Kiểm tra browser có hỗ trợ Web Speech API không
        if ('speechSynthesis' in window) {
            // Tạo utterance mới
            const utterance = new SpeechSynthesisUtterance(textToSpeak);

            // Tự động phát hiện và cấu hình ngôn ngữ
            const detectedLang = detectLanguage(textToSpeak);
            utterance.lang = detectedLang;
            utterance.rate = 1; // Tốc độ đọc (0.1 - 10)
            utterance.pitch = 1; // Độ cao giọng (0 - 2)
            utterance.volume = 1; // Âm lượng (0 - 1)

            // Xử lý khi bắt đầu đọc
            utterance.onstart = () => {
                setIsSpeaking(true);
                onSpeakingChange?.(true);
            };

            // Xử lý khi kết thúc đọc
            utterance.onend = () => {
                setIsSpeaking(false);
                onSpeakingChange?.(false);
                speechSynthesisRef.current = null;
            };

            // Xử lý lỗi
            utterance.onerror = (event) => {
                console.error('Text-to-speech error:', event);
                setIsSpeaking(false);
                onSpeakingChange?.(false);
                speechSynthesisRef.current = null;
            };

            // Lưu reference để có thể dừng sau
            speechSynthesisRef.current = utterance;

            // Bắt đầu đọc
            window.speechSynthesis.speak(utterance);
        } else {
            console.warn('Text-to-speech is not supported in this browser');
        }
    }

    // Dừng phát âm thanh khi text thay đổi
    useEffect(() => {
        if (speechSynthesisRef.current && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            onSpeakingChange?.(false);
            speechSynthesisRef.current = null;
        }
    }, [text]);

    // Cleanup khi component unmount
    useEffect(() => {
        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    return (
        <Button
            variant={isSpeaking ? 'default' : 'outline'}
            size="icon"
            className={cn('h-12 w-12 rounded-full', className)}
            onClick={handleTextToSpeech}
            title={isSpeaking ? 'Dừng đọc' : 'Đọc âm thanh'}
        >
            {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
    );
}

