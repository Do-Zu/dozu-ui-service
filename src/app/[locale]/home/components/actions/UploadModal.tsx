'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/modal/Modal';
import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';

interface UploadModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, setIsOpen }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        // Handle file drop here
    };

    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            body={
                <div
                    className={`mt-4 rounded-3xl p-8 flex flex-col items-center justify-center transition-colors ${
                        isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className="p-4 rounded-full bg-muted mb-4">
                        <UploadCloud className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-center mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground text-center mb-4">PDF, Doc, Txt</p>
                    <Button variant="outline" size="sm">
                        Select File
                    </Button>
                    <input type="file" className="hidden" />
                </div>
            }
            footer={
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="ghost" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={() => setIsOpen(false)}>Upload</Button>
                </div>
            }
        />
    );
};
