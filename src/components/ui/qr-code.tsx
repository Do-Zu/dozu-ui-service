'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { cn } from '@/lib/utils';

interface QRCodeProps {
    value: string;
    size?: number;
    className?: string;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    margin?: number;
    color?: {
        dark?: string;
        light?: string;
    };
}

export function QRCodeComponent({
    value,
    size = 256,
    className,
    errorCorrectionLevel = 'M',
    margin = 4,
    color = {
        dark: '#000000',
        light: '#FFFFFF',
    },
}: QRCodeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current && value) {
            QRCode.toCanvas(
                canvasRef.current,
                value,
                {
                    width: size,
                    margin,
                    errorCorrectionLevel,
                    color,
                },
                (error) => {
                    if (error) {
                        console.error('QR Code generation error:', error);
                    }
                },
            );
        }
    }, [value, size, margin, errorCorrectionLevel, color]);

    // Check if value is an HTTP/HTTPS URL for an image
    const isImageUrl = (url: string): boolean => {
        try {
            const urlObj = new URL(url);
            return (
                (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') &&
                /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(urlObj.pathname)
            );
        } catch {
            return false;
        }
    };

    if (!value) {
        return (
            <div
                className={cn(
                    'flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg',
                    className,
                )}
                style={{ width: size, height: size }}
            >
                <span className="text-gray-400 text-sm">No QR Code</span>
            </div>
        );
    }

    // If value is an image URL, display the image instead of QR code
    if (isImageUrl(value)) {
        return (
            <div className={cn('flex justify-center', className)}>
                <img
                    src={value}
                    alt="Image from URL"
                    className="border border-gray-200 rounded-lg shadow-sm object-contain"
                    style={{
                        maxWidth: size,
                        maxHeight: size,
                        width: 'auto',
                        height: 'auto',
                    }}
                    onError={(e) => {
                        console.error('Image loading error:', e);
                        // Fallback to QR code if image fails to load
                        e.currentTarget.style.display = 'none';
                    }}
                />
            </div>
        );
    }

    return (
        <div className={cn('flex justify-center', className)}>
            <canvas
                ref={canvasRef}
                className="border border-gray-200 rounded-lg shadow-sm"
                style={{ maxWidth: '100%', height: 'auto' }}
            />
        </div>
    );
}
