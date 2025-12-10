'use client';

import React from 'react';
import { Modal } from '@/components/modal/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Link as LinkIcon, FileText } from 'lucide-react';

interface PasteLinkModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export const PasteLinkModal: React.FC<PasteLinkModalProps> = ({ isOpen, setIsOpen }) => {
    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            className="max-w-[400px]"
            body={
                <div className="flex flex-col gap-6 ">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <LinkIcon className="w-4 h-4" />
                            <span>YouTube, Website, Etc</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Enter a YouTube Link , Website URL</p>
                        <Input placeholder="https://youtu.be/..." className="bg-background" />
                    </div>

                    {/* Divider */}
                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-border"></div>
                        <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground">or</span>
                        <div className="flex-grow border-t border-border"></div>
                    </div>

                    {/* Text Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <FileText className="w-4 h-4" />
                            <span>Paste Text</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Copy and paste text to add as content</p>
                        <Textarea
                            placeholder="Paste your notes here"
                            className="min-h-[120px] bg-background resize-none"
                        />
                    </div>
                </div>
            }
            footer={
                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={() => setIsOpen(false)}>Add</Button>
                </div>
            }
        />
    );
};
