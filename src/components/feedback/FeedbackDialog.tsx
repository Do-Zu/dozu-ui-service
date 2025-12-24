'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Image, Send, X, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { postRequest } from '@/api/api';
import { toast } from '@/hooks/use-toast';

interface FeedbackDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
    const t = useTranslations('feedback');
    const [feedback, setFeedback] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
    };

    const handleCancel = () => {
        setFeedback('');
        setSelectedImage(null);
        setImagePreview(null);
        onOpenChange(false);
    };

    const handleSubmit = async () => {
        if (!feedback.trim() || isSubmitting) return;

        setIsSubmitting(true);

        try {
            // Create FormData to send both message and file
            const formData = new FormData();
            formData.append('message', feedback.trim());

            // Note: Backend expects field name 'file' for fileUploadSingleMiddleware
            if (selectedImage) {
                formData.append('file', selectedImage);
            }

            // Call API to submit feedback
            const response = await postRequest<FormData, { message: string }>('/feedback/submit', formData);

            // Backend returns status: 'success' for SuccessResponse.ok()
            if (response.status === 'success' || response.status === 'created' || response.status === 'accepted') {
                toast({ description: t('successMessage') });
                handleCancel();
            } else {
                throw new Error(response.message || t('errorMessage'));
            }
        } catch (error: any) {
            console.error('Error submitting feedback:', error);
            toast({ description: error?.message || t('errorMessage'), variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t('title')}</DialogTitle>
                    <DialogDescription>
                        {t('description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-3">
                        <Textarea
                            placeholder={t('placeholder')}
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="min-h-[120px] resize-none"
                        />

                        {imagePreview && (
                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-auto rounded-md border max-h-[200px] object-contain"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 h-6 w-6 bg-background/80 hover:bg-background"
                                    onClick={handleRemoveImage}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                                id="image-upload"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => document.getElementById('image-upload')?.click()}
                            >
                                <Image className="h-4 w-4" />
                            </Button>

                            <div className="flex-1 flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancel}
                                    className="flex-1"
                                    disabled={isSubmitting}
                                >
                                    {t('cancel')}
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleSubmit}
                                    className="flex-1"
                                    disabled={!feedback.trim() || isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                            {t('submitting')}
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-1" />
                                            {t('submit')}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="text-xs text-muted-foreground pt-2 border-t">
                        <p>
                            {t('community')}{' '}
                            <a
                                href="https://discord.gg/dozu"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 dark:text-green-400 hover:underline"
                            >
                                {t('discordCommunity')}
                            </a>{' '}
                            {t('communityDescription')}
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
