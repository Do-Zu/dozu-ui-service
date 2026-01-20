import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useEventSourceStream } from '../useEventSourceStream';
import { BASE_URL_STREAMING_CHUNK_CONTENT_GENERATE } from '@/app/[locale]/generate/utils/constant';
import { toast } from '../use-toast';
import { IGenerateRequest, ValidateGeneratedDataFn } from './type';

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

    const {
        execute,
        data: sseData,
        status: sseStatus,
    } = useEventSourceStream<IGenerateRequest, ISseDataStream>(BASE_URL_STREAMING_CHUNK_CONTENT_GENERATE, {
        method: 'POST',
        onMessage: (data) => {
            if (options?.onChunk) {
                options.onChunk(data);
            }
        },
    });

    const executeGenerate = async (payload: IGenerateRequest) => {
        await execute({ ...payload });
    };

    const isGenerating: boolean = useMemo(() => {
        return sseStatus === 'connecting';
    }, [sseStatus]);

    const reset = useCallback(() => {
        setChunkData(null);
    }, []);

    useEffect(() => {
        if (sseStatus === 'timeout' || sseStatus === 'error') {
            toast({
                description: sseStatus === 'timeout' ? t('toasts.timeout') : t('toasts.error'),
            });

            if (sseStatus === 'error' && options && options.onError) {
                options.onError();
            }
        } else if (sseData && sseStatus === 'completed') {
            const dataResponse = sseData?.data as TRes;

            if (options && options.onSuccess) {
                options.onSuccess(dataResponse);
            }

            setChunkData(dataResponse);
        }
    }, [sseData, sseStatus]);

    return {
        isGenerating,
        execute: executeGenerate,
        reset,
        chunkData,
    };
}
