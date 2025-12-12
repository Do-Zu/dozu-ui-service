'use client';

import React from 'react';
import { Modal } from '@/components/modal/Modal';
import { Mic, Monitor } from 'lucide-react';
import { useActionStore } from './context/ActionContext';
import { toast } from 'sonner';

export const RecordModal: React.FC = () => {
    const isOpen = useActionStore((state) => state.showRecord);
    const setIsOpen = useActionStore((state) => state.setShowRecord);
    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title="Select Audio Type"
            body={
                <div className="flex flex-col gap-3 mt-2">
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

                    <button
                        className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent hover:text-accent-foreground transition-colors text-left group"
                        onClick={() => toast('feature in coming')}
                    >
                        <div className="p-3 rounded-full bg-muted group-hover:bg-background transition-colors">
                            <Monitor className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="font-medium text-sm">Browser Tab</span>
                            <span className="text-xs text-muted-foreground">
                                Capture audio playing in a browser tab
                            </span>
                        </div>
                    </button>
                </div>
            }
        />
    );
};
