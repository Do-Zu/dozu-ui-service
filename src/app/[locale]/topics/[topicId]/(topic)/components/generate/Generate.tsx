import { Button } from '@/components/ui/button';
import useGenerate, { IGenerateOptions, ValidateGeneratedDataFn } from '@/hooks/generate/useGenerate';
import { ReactNode, useMemo } from 'react';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import { ImportMethod } from '@/app/[locale]/generate/constants/resource';
import DataStatus from '@/components/errors/DataStatus';
import { isNilOrEmpty } from '@/utils';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { CustomizeProperties } from '@/app/[locale]/topics/[topicId]/(topic)/components/generate/CustomizeProperties';
import { TypeMethodLearning } from '@/utils/constants/method';
import { GenerateProvider, useGenerateContext } from '../../context/GenerateContext';
import { ICustomOptions, IGenerateType, IStartGenerateFn, MultiNodeGenerateEnum } from '../../types/generate.type';
import toastHelper from '@/utils/toast.helper';

/**
 * Props for the reusable Generate<TRes> component.
 * TRes is the expected payload returned by the generate action.
 */
interface IProps<TRes> {
    /** Optional custom trigger element (e.g., a Button). If omitted, a default "Generate" button is used. */
    trigger?: (startGenerate: IStartGenerateFn) => ReactNode;
    customGenerateTrigger?: (startGenerate: IStartGenerateFn) => ReactNode;
    /** Import method used by the generator. Defaults to 'text'. */
    method?: ImportMethod;
    /** Required type describing what to generate (domain-specific). */
    type: IGenerateType;
    /** Optional custom UI when "generating" (after request sent). Overrides the default spinner. */
    generateNode?: ReactNode;
    /** Optional custom UI while "registering" (pre-flight/queueing). Overrides the default spinner. */
    registerNode?: ReactNode;
    /**
     * Reserved: optional label for the default trigger.
     * Note: Currently not used by the component. Prefer passing a custom "trigger" instead.
     */
    titleTrigger?: string;
    /** Callback executed right before validations and generating start (e.g., persist form state). */
    onHandleBeforeGenerate?: () => void;
    /** Callback executed after receiving generated data, used to validate generated data (using Zod and throw error) */
    validateGeneratedData?: ValidateGeneratedDataFn<TRes>;
    /** Called when generation succeeds. Receives the typed payload TRes. */
    onSuccess?: (data: TRes) => void;
    /** Called when the underlying request fails (from useGenerate). */
    onError?: (error: unknown) => void;
    /** Called for unexpected errors thrown in the flow (e.g., pre-call or parsing). */
    onFallBack?: (error: unknown) => void;
    /** Always called after attempt finishes (success or failure). Useful for cleanup. */
    onFinally?: () => void;
}

const DEFAULT_METHOD = 'text';

function GenerateContent<TRes>({
    method = DEFAULT_METHOD,
    type,
    trigger,
    customGenerateTrigger,
    generateNode,
    registerNode,
    onHandleBeforeGenerate,
    validateGeneratedData,
    onSuccess,
    onError,
    onFallBack,
    onFinally,
}: IProps<TRes>) {
    const { contentTextOrigin } = useTopicWorkspace();
    const { options } = useGenerateContext();

    const { isGenerating, isRegisterGenerate, apiPostContentError, dataGenerated, execute } = useGenerate<TRes>({
        onSuccess,
        onError,
        validateGeneratedData,
    });

    // Entry point: validates input and kicks off the generate call.
    const handleStartGenerate = async (content: string = contentTextOrigin.current, customOptions?: ICustomOptions) => {
        try {
            onHandleBeforeGenerate?.();

            if (isNilOrEmpty(content)) {
                toast({
                    description: 'No content prepared',
                });
                return;
            }

            const mergedOptions: IGenerateOptions = {
                commonGenerateOptions: options,
                ...customOptions,
            };

            await execute({
                content,
                method,
                type,
                options: mergedOptions,
            });
        } catch (error) {
            onFallBack?.(error);
        } finally {
            onFinally?.();
        }
    };

    if (isRegisterGenerate) {
        return registerNode ? (
            registerNode
        ) : (
            <div className="w-full flex items-center justify-center min-h-24 py-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing ...</span>
                </div>
            </div>
        );
    }

    if (isGenerating) {
        return generateNode ? (
            generateNode
        ) : (
            <div className="w-full flex items-center justify-center min-h-24 py-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating ...</span>
                </div>
            </div>
        );
    }

    if (!isRegisterGenerate && !isGenerating && apiPostContentError) {
        return (
            <div className="w-full flex items-center justify-center min-h-24 py-4">
                <DataStatus variant="error" />
            </div>
        );
    }

    // Idle state: show custom trigger if provided; otherwise, a centered default button.
    // To customize label/appearance, pass a "trigger" node.
    const defaultTrigger = (
        <Button onClick={() => handleStartGenerate()} className="rounded-2xl">
            Generate
        </Button>
    );

    const renderCustomize = () => {
        if (type === 'flashcard' || type === 'quiz' || type === MultiNodeGenerateEnum.MULTI_NODE_FLASHCARD)
            return (
                <CustomizeProperties
                    className="mx-3"
                    method={type}
                    generateTrigger={customGenerateTrigger ?? trigger}
                    onGenerate={(content, options) => handleStartGenerate(content, options)}
                />
            );

        return <></>;
    };

    return (
        <div className="flex items-center justify-center">
            {renderCustomize()}
            {trigger ? trigger(handleStartGenerate) : <div className="py-4">{defaultTrigger}</div>}
        </div>
    );
}

/**
 * Generate<TRes>
 * Reusable generator trigger with built-in centered button, loading states, and error UI.
 * - Idle: renders "trigger" (or a default Generate button).
 * - Registering: shows a centered spinner (or "registerNode" if provided).
 * - Generating: shows a centered spinner (or "generateNode" if provided).
 * - Error: shows a centered DataStatus with "error".
 *
 * Usage:
 * <Generate<MyPayload>
 *   type="flashcard"
 *   method="text"
 *   trigger={<Button>Generate Flashcards</Button>}
 *   onHandleBeforeGenerate={() => { validate/save form
 *   onSuccess={(data) => {/* handle success }}
 *   onError={() => { handle error }}
 *
 */
export default function Generate<TRes>(props: IProps<TRes>) {
    return (
        <GenerateProvider>
            <GenerateContent {...props} />
        </GenerateProvider>
    );
}
