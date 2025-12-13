'use client';

import React from 'react';
import { Modal } from '@/components/modal/Modal';
import { Mic } from 'lucide-react';
import { useActionStore } from './context/ActionContext';
import { toast } from 'sonner';
import useUploadAudioFile from './hooks/useUploadAudioFile';
import UploadAudioFileInput from './components/upload/UploadAudioFileInput';

export const RecordModal: React.FC = () => {
    const { showRecord: isOpen, setShowRecord: setIsOpen, isProcessing } = useActionStore((state) => state);

    const { isDragging, handleDragOver, handleDragEnter, handleDragLeave, handleFileChange, handleDrop } =
        useUploadAudioFile();

    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title="Upload or record audio."
            body={
                <div className="flex flex-col gap-6 mt-2">
                    <UploadAudioFileInput
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onFileChange={handleFileChange}
                        isDragging={isDragging}
                        isProcessing={isProcessing}
                    />

                    <button
                        className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent hover:text-accent-foreground transition-colors text-left group"
                        onClick={() => toast('feature in coming')}
                    >
                        <div className="p-3 rounded-full bg-muted group-hover:bg-background transition-colors">
                            <Mic className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="font-medium text-sm">Microphone</span>
                            <span className="text-xs text-muted-foreground">Record your voice or class</span>
                        </div>
                    </button>
                </div>
            }
        />
    );
};
