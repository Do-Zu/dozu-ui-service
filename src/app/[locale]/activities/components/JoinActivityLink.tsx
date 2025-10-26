'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Share2, Users, Link as LinkIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface JoinActivityLinkProps {
    activityId: string;
    activityTitle: string;
    className?: string;
}

export default function JoinActivityLink({ 
    activityId, 
    activityTitle, 
    className = '' 
}: JoinActivityLinkProps) {
    const [copied, setCopied] = useState(false);
    
    const joinUrl = `${window.location.origin}/activities/join/${activityId}`;
    
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(joinUrl);
            setCopied(true);
            toast({
                title: 'Link copied',
                description: 'Activity join link has been copied to clipboard.',
            });
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy link:', error);
            toast({
                title: 'Copy failed',
                description: 'Failed to copy link to clipboard.',
                variant: 'destructive',
            });
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Join Activity: ${activityTitle}`,
                    text: `Join the activity "${activityTitle}"`,
                    url: joinUrl,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            // Fallback to copy
            handleCopyLink();
        }
    };

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Share Activity with Students
                </CardTitle>
                <p className="text-sm text-gray-600">
                    Share this link with your students so they can join the activity.
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                    <LinkIcon className="h-4 w-4 text-gray-500" />
                    <Input
                        value={joinUrl}
                        readOnly
                        className="flex-1"
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyLink}
                        className={copied ? 'bg-green-100 text-green-800' : ''}
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
                
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={handleShare}
                        className="flex items-center gap-2"
                    >
                        <Share2 className="h-4 w-4" />
                        Share
                    </Button>
                    
                    <div className="text-sm text-gray-500">
                        Students can join using this link
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
