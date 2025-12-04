import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import usePost from '../usePost';
import { useEventSource } from '../useEventSource';
import { ApiResponsePubGenContent, ISseData } from '@/app/[locale]/generate';
import { BASE_URL_STREAM_GENERATE, URL_API_GENERATE } from '@/app/[locale]/generate/utils/constant';
import { compressContent } from '@/app/[locale]/generate/helper/compress';
import { toast } from '../use-toast';
import { LearningGenerationOptions, NodesData } from '@/app/[locale]/topics/[topicId]/(topic)/types/generate.type';

export interface IGenerateRequest {
    content: string;
    method: string;
    type: string;
    options?: LearningGenerationOptions | NodesData;
}

export interface UsePostOptions<TReq, TRes> {
    onSuccess?: (data: TRes) => void;
    onError?: (error?: unknown) => void;
}

/**
 * Custom hook for handling content generation with Server-Sent Events (SSE) streaming.
 *
 * This hook manages the complete lifecycle of content generation:
 * - Compresses and sends content to the generation API
 * - Receives a job ID and establishes an SSE connection
 * - Monitors the generation progress via SSE
 * - Handles success/error states and displays toast notifications
 *
 * @template TRes - The expected type of the generated data response
 *
 * @param {UsePostOptions<IGenerateRequest, TRes>} [options] - Optional callbacks for success and error handling
 * @param {(data: TRes) => void} [options.onSuccess] - Callback invoked when generation completes successfully
 * @param {(error?: unknown) => void} [options.onError] - Callback invoked when an error occurs
 *
 * @returns {Object} Hook utilities and state
 * @returns {boolean} isGenerating - Whether content is currently being generated
 * @returns {boolean} loading - Whether the initial API request is in progress
 * @returns {ApiResponsePubGenContent | undefined} apiResponse - The API response containing the job ID
 * @returns {unknown} apiPostContentError - Any error from the initial API request
 * @returns {(params: IGenerateRequest) => Promise<void>} execute - Function to trigger content generation
 * @returns {() => void} reset - Function to reset the hook state
 * @returns {TRes | undefined} dataGenerated - The final generated data after completion
 * @returns {React.Dispatch<React.SetStateAction<TRes | undefined>>} setDataGenerated - Setter for the generated data
 *
 * @example
 * ```tsx
 * const { execute, isGenerating, dataGenerated } = useGenerate<GeneratedContent>({
 *   onSuccess: (data) => console.log('Generated:', data),
 *   onError: (error) => console.error('Failed:', error)
 * });
 *
 * // Trigger generation
 * await execute({
 *   content: 'Raw content to generate from',
 *   method: 'file',
 *   type: 'flashcard'
 * });
 * ```
 */
export default function useGenerate<TRes = unknown>(options?: UsePostOptions<IGenerateRequest, TRes>) {
    const t = useTranslations('generate.cardImport');
    const [jobId, setJobId] = useState<string | undefined>();
    const [dataGenerated, setDataGenerated] = useState<TRes | undefined>();
    const {
        loading: isRegisterGenerate,
        data: apiRegisterResponse,
        error: apiPostContentError,
        execute,
        reset,
    } = usePost<IGenerateRequest, ApiResponsePubGenContent>(URL_API_GENERATE, 'POST');

    const { data: sseData, status: sseStatus } = useEventSource<ISseData>(
        jobId ? `${BASE_URL_STREAM_GENERATE}/${jobId}` : null,
    );

    const executeGenerate = async ({ content, method, type, options }: IGenerateRequest) => {
        const compressedContent = compressContent(content);

        await execute({
            content: compressedContent,
            method: method,
            type: type,
            options,
        });
    };

    const isGenerating: boolean = useMemo(() => {
        return !!jobId && sseStatus === 'open';
    }, [sseStatus, jobId]);

    useEffect(() => {
        if (!isRegisterGenerate && apiRegisterResponse) {
            const { data } = apiRegisterResponse;
            const jobId = data?.jobId;
            setJobId(jobId);
        }
    }, [apiRegisterResponse, isRegisterGenerate]);

    useEffect(() => {
        if (apiPostContentError) {
            toast({
                description: apiPostContentError,
            });

            if (options && options.onError) {
                options.onError(apiPostContentError);
            }
        }
    }, [apiPostContentError]);

    useEffect(() => {
        if (sseStatus === 'timeout' || sseStatus === 'error') {
            toast({
                description: sseStatus === 'timeout' ? t('toasts.timeout') : t('toasts.error'),
            });

            if (sseStatus === 'error' && options && options.onError) {
                options.onError();
            }
        } else if (sseData && sseStatus === 'completed') {
            // toast({
            //     description: t('toasts.success'),
            // });

            const dataGenerated = sseData?.data?.data as TRes;

            if (options && options.onSuccess) {
                options.onSuccess(dataGenerated);
            }

            setDataGenerated(dataGenerated);
        }
    }, [sseData, sseStatus]);

    return {
        isGenerating,
        isRegisterGenerate,
        apiRegisterResponse,
        apiPostContentError,
        execute: executeGenerate,
        reset,
        dataGenerated,
        setDataGenerated,
    };
}
