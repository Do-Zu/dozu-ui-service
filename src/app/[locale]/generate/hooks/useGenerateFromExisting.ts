'use client';

import { useEffect, useState } from 'react';
import usePost from '@/hooks/usePost';
import { useEventSource } from '@/hooks/useEventSource';
import { compressContent } from '@/app/[locale]/generate/helper/compress';
import { toast } from '@/hooks/use-toast';
import { ApiResponsePubGenContent, ISseData } from '@/app/[locale]/generate/types';
import { URL_API_GENERATE } from '@/app/[locale]/generate/utils/constant';

type TargetType = 'flashcard' | 'quiz';

export function useGenerateFromExisting() {
    const [jobId, setJobId] = useState<string | undefined>();
    const [targetType, setTargetType] = useState<TargetType | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);

    const {
        loading,
        data: apiResponse,
        error: apiPostError,
        execute,
    } = usePost<unknown, ApiResponsePubGenContent>(URL_API_GENERATE, 'POST');

    const { data: sseData, status: sseStatus } = useEventSource<ISseData>(
        jobId ? `/event/generate/job/${jobId}` : null,
    );

    useEffect(() => {
        if (apiResponse?.data?.jobId) setJobId(apiResponse.data.jobId);
    }, [apiResponse]);

    useEffect(() => {
        if (apiPostError) {
            toast({ description: String(apiPostError), variant: 'destructive' });
        }
    }, [apiPostError]);

    useEffect(() => {
        if (sseStatus === 'timeout' || sseStatus === 'error') {
            toast({
                description: sseStatus === 'timeout' ? 'Waiting time out' : 'Error getting results',
                variant: 'destructive',
            });
        }
        const payloadStatus = (sseData as any)?.status ?? (sseData as any)?.data?.status; 

        if (sseStatus === 'completed' || payloadStatus === 'completed') {
            setPreviewOpen(true);
            toast({ description: 'Content created', variant: 'default' });
        }
    }, [sseStatus, sseData]);

    const regenerate = async (contentString: string, type: TargetType) => {
        setTargetType(type);
        const compressed = compressContent(contentString);
        await execute({
            content: compressed,
            method: 'text',
            type,
        });
    };

    return {
        regenerate,
        targetType,
        previewOpen,
        setPreviewOpen,
        jobId,
        sseData,
        sseStatus,
        loading,
    };
}
