import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useEventSourceStream } from '../useEventSourceStream';
import { BASE_URL_STREAMING_CHUNK_CONTENT_GENERATE } from '@/app/[locale]/generate/utils/constant';
import { toast } from '../use-toast';
import { IGenerateRequest, ValidateGeneratedDataFn } from './type';
import { isNilOrEmpty, safeDestructure, safeJsonParse } from '@/utils';
import toastHelper from '@/utils/toast.helper';

export interface ISseDataStream {
    data: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface UsePostOptions<TReq, TRes> {
    onSuccess?: (data: TRes) => void;
    onError?: (error?: unknown) => void;
    onChunk?: (data: ISseDataStream) => void;
    validateGeneratedData?: ValidateGeneratedDataFn<TRes>;
}

/**
 * Custom hook for handling content generation with Server-Sent Events (SSE) streaming.
 *
 * This hook manages the complete lifecycle of content generation:
 *
 */
export default function useGenerateStream<TRes = unknown>(options?: UsePostOptions<IGenerateRequest, TRes>) {
    const t = useTranslations('generate.cardImport');
    const [chunkData, setChunkData] = useState<TRes | null>(null);
    const [finalData, setFinalData] = useState<string>('');
    const [error, setError] = useState<unknown>(null);
    const {
        execute,
        data: sseData,
        status: sseStatus,
    } = useEventSourceStream<IGenerateRequest, ISseDataStream>(BASE_URL_STREAMING_CHUNK_CONTENT_GENERATE, {
        method: 'POST',
        onMessage: (data) => {
            const chunkText = typeof data?.data === 'string' ? data.data : '';

            if (chunkText) {
                setFinalData((prev) => prev + chunkText);
            }

            if (options?.onChunk) {
                options.onChunk(data);
            }
        },
    });

    const executeGenerate = async (payload: IGenerateRequest) => {
        setFinalData('');
        await execute({ ...payload });
    };

    const isGenerating: boolean = useMemo(() => {
        return sseStatus === 'connecting';
    }, [sseStatus]);

    const reset = useCallback(() => {
        setChunkData(null);
        setFinalData('');
    }, []);

    useEffect(() => {
        if (sseStatus === 'timeout' || sseStatus === 'error') {
            toast({
                description: sseStatus === 'timeout' ? t('toasts.timeout') : t('toasts.error'),
            });

            if (sseStatus === 'error' && options && options.onError) {
                options.onError();
                setError(sseData);
            }
        } else if (sseData && sseStatus === 'completed') {
            const { onSuccess } = safeDestructure(options);

            const parsed = safeJsonParse<TRes>(finalData);

            if (isNilOrEmpty(parsed)) {
                options?.onError?.(new Error('Try again'));
                toastHelper.showLog('Failed to parse response when stream generate');
            } else {
                onSuccess?.(parsed!);
            }
        }
    }, [sseData, sseStatus]);

    return {
        isGenerating,
        execute: executeGenerate,
        reset,
        chunkData,
        finalData,
        error,
    };
}
