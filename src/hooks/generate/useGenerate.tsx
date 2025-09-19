import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import usePost, { UsePostOptions } from '../usePost';
import { useEventSource } from '../useEventSource';
import { ApiResponsePubGenContent, ISseData } from '@/app/[locale]/generate';
import { URL_API_GENERATE } from '@/app/[locale]/generate/utils/constant';
import { toast } from '../use-toast';
import { compressContent } from '@/app/[locale]/generate/helper/compress';

export interface IGenerateRequest {
    content: string;
    method: string;
    type: string;
}

export default function useGenerate<TRes = unknown>(
    options?: UsePostOptions<IGenerateRequest, ApiResponsePubGenContent>,
) {
    const t = useTranslations('generate.cardImport');
    const [jobId, setJobId] = useState<string | undefined>();
    const [dataGenerated, setDataGenerated] = useState<TRes | undefined>();
    const {
        loading,
        data: apiResponse,
        error: apiPostContentError,
        execute,
        reset,
    } = usePost<IGenerateRequest, ApiResponsePubGenContent>(URL_API_GENERATE, 'POST', options);

    const { data: sseData, status: sseStatus } = useEventSource<ISseData>(
        jobId ? `/event/generate/job/${jobId}` : null,
    );

    const executeGenerate = async ({ content, method, type }: IGenerateRequest) => {
        const compressedContent = compressContent(content);

        await execute({
            content: compressedContent,
            method: method,
            type: type,
        });
    };

    const isGenerating = useMemo(() => {
        return jobId && sseStatus === 'open';
    }, [sseStatus, jobId]);

    useEffect(() => {
        if (apiResponse) {
            const { data, sse } = apiResponse;
            const jobId = data?.jobId;
            setJobId(jobId);
        }
    }, [apiResponse]);

    useEffect(() => {
        if (apiPostContentError) {
            toast({
                description: apiPostContentError,
            });
        }
    }, [apiPostContentError]);

    useEffect(() => {
        if (sseStatus === 'timeout' || sseStatus === 'error') {
            toast({
                description: sseStatus === 'timeout' ? t('toasts.timeout') : t('toasts.error'),
            });
        } else if (sseData && sseStatus === 'completed') {
            toast({
                description: t('toasts.success'),
            });
            setDataGenerated(sseData?.data?.data as TRes);
        }
    }, [sseData, sseStatus]);

    return {
        isGenerating,
        loading,
        apiResponse,
        apiPostContentError,
        execute: executeGenerate,
        reset,
        dataGenerated,
    };
}
