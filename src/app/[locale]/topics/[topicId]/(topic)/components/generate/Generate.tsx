import { Button } from '@/components/ui/button';
import useGenerate from '@/hooks/generate/useGenerate';
import { ReactNode, useMemo } from 'react';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import { ImportMethod } from '@/app/[locale]/generate/constants/resource';
import DataStatus from '@/components/errors/DataStatus';
import { isNilOrEmpty } from '@/utils';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import GenerateStreaming from '@/components/generative/GenerateStreaming';
import { CustomizeProperties } from '@/app/[locale]/topics/[topicId]/(topic)/components/generate/CustomizeProperties';
import { TypeMethodLearning } from '@/utils/constants/method';
import { GenerateProvider, useGenerateContext } from '../../context/GenerateContext';

/**
 * Props for the reusable Generate<TRes> component.
 * TRes is the expected payload returned by the generate action.
 */
interface IProps<TRes> {
    /** Optional custom trigger element (e.g., a Button). If omitted, a default "Generate" button is used. */
    trigger?: ReactNode;
    /** Import method used by the generator. Defaults to 'text'. */
    method?: ImportMethod;
    /** Required type describing what to generate (domain-specific). */
    type: TypeMethodLearning;
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
    /** Called when generation succeeds. Receives the typed payload TRes. */
    onSuccess?: (data: TRes) => void;
    /** Called when the underlying request fails (from useGenerate). */
    onError?: () => void;
    /** Called for unexpected errors thrown in the flow (e.g., pre-call or parsing). */
    onFallBack?: (error: unknown) => void;
    /** Always called after attempt finishes (success or failure). Useful for cleanup. */
    onFinally?: () => void;
    customContent?: string;
}

const DEFAULT_METHOD = 'text';

function GenerateContent<TRes>({
    method = DEFAULT_METHOD,
    type,
    trigger,
    generateNode,
    registerNode,
    onHandleBeforeGenerate,
    onSuccess,
    onError,
    onFallBack,
    onFinally,
    customContent,
}: IProps<TRes>) {
    const { contentTextOrigin } = useTopicWorkspace();
    const generatingContent = customContent && customContent.length > 0 ? customContent : contentTextOrigin.current;
    const { options } = useGenerateContext();

    const { isGenerating, isRegisterGenerate, apiPostContentError, dataGenerated, execute } = useGenerate<TRes>({
        onSuccess,
        onError,
    });

    // Entry point: validates input and kicks off the generate call.
    const handleStartGenerate = async () => {
        try {
            onHandleBeforeGenerate?.();

            if (isNilOrEmpty(generatingContent)) {
                toast({
                    description: 'No content prepare',
                });
                return;
            }

            await execute({
                content: generatingContent,
                method,
                type,
                options,
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
        <Button onClick={handleStartGenerate} className="rounded-2xl">
            Generate
        </Button>
    );

    const renderCustomize = () => {
        if (type === 'flashcard' || type === 'quiz')
            return <CustomizeProperties className="mx-3" method={type} onGenerate={handleStartGenerate} />;

        return <></>;
    };

    return (
        <div className="flex items-center justify-center">
            {renderCustomize()}
            {trigger ? (
                <div onClick={handleStartGenerate}>{trigger}</div>
            ) : (
                <div className="py-4">{defaultTrigger}</div>
            )}
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
