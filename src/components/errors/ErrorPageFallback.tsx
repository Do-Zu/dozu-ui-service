'use client';

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface ErrorPageFallbackProps {
    error: Error;
    reset: () => void;
}

export default function ErrorPageFallback({ error, reset }: ErrorPageFallbackProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-6 py-12 bg-background">
            <div className="max-w-md">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <AlertTriangle className="text-destructive w-6 h-6" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-destructive">Có lỗi xảy ra trong hệ thống</h1>
                </div>

                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    Rất tiếc! Đã có sự cố xảy ra khi tải trang hoặc xử lý dữ liệu. <br />
                    Vui lòng thử lại hoặc quay về trang chủ.
                </p>

                <div className="bg-muted text-left text-sm rounded-md p-4 text-muted-foreground shadow-inner mb-8">
                    <strong className="block font-medium text-destructive mb-1">Chi tiết kỹ thuật:</strong>
                    <code className="block whitespace-pre-wrap break-words">{error.message}</code>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={reset}
                        className="inline-flex items-center justify-center gap-2 bg-red-600 text-foreground px-5 py-2.5 rounded-md shadow hover:bg-red-700 transition"
                    >
                        <RotateCcw size={18} />
                        Thử lại
                    </button>
                    <a
                        href="/"
                        className="inline-flex items-center justify-center gap-2 bg-muted text-foreground px-5 py-2.5 rounded-md shadow hover:bg-muted/70 transition"
                    >
                        <Home size={18} />
                        Về trang chủ
                    </a>
                </div>
            </div>
        </div>
    );
}
