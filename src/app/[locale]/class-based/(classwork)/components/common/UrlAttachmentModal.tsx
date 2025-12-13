'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (urlData: string) => void;
}

export default function UrlAttachmentModal({ open, onClose, onSubmit }: Props) {
    // const [title, setTitle] = useState('');
    const [link, setLink] = useState('');

    function handleAdd() {
        if (!link) return;
        onSubmit(link);
        // setTitle('');
        setLink('');
        onClose();
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Add link</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    {/* <Input placeholder="Link title" value={title} onChange={(e) => setTitle(e.target.value)} /> */}
                    <Input placeholder="Paste URL" value={link} onChange={(e) => setLink(e.target.value)} />
                </div>

                <div className="flex justify-end mt-6">
                    <Button onClick={handleAdd}>Add</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
