import { Button } from '@/components/ui/button';
import useGenerate from '@/hooks/generate/useGenerate';
import { ReactNode } from 'react';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import { ImportMethod, TypeMethodLeading } from '@/app/[locale]/generate/constants/resource';
import DataStatus from '@/components/errors/DataStatus';
import { isNilOrEmpty } from '@/utils';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface IProps<TRes> {
    trigger?: ReactNode;
    method?: ImportMethod;
    type: TypeMethodLeading;
    generateNode?: ReactNode;
    registerNode?: ReactNode;
    titleTrigger?: string;
    onHandleBeforeGenerate?: () => void;
    onSuccess?: (data: TRes) => void;
    onError?: () => void;
    onFallBack?: (error: unknown) => void;
    onFinally?: () => void;
}

const DEFAULT_METHOD = 'text';

export default function Generate<TRes>({
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
}: IProps<TRes>) {
    const { contentTextOrigin } = useTopicWorkspace();

    const { isGenerating, isRegisterGenerate, apiPostContentError, dataGenerated, execute } = useGenerate<TRes>({
        onSuccess,
        onError,
    });

    const handleStartGenerate = async () => {
        try {
            onHandleBeforeGenerate?.();

            if (isNilOrEmpty(contentTextOrigin.current)) {
                toast({
                    description: 'No content prepare',
                });
                return;
            }

            await execute({
                content: contentTextOrigin.current,
                method,
                type,
            });
        } catch (error) {
            onFallBack?.(error);
        } finally {
            onFinally?.();
        }
    };

    if (isRegisterGenerate) {
        return (
            <div className="w-full flex items-center justify-center min-h-24 py-4">
                {registerNode ? (
                    registerNode
                ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processing ...</span>
                    </div>
                )}
            </div>
        );
    }

    if (isGenerating) {
        return (
            <div className="w-full flex items-center justify-center min-h-24 py-4">
                {generateNode ? (
                    generateNode
                ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Generating ...</span>
                    </div>
                )}
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

    const defaultTrigger = <Button onClick={handleStartGenerate}>Generate</Button>;

    return <div className="w-full flex items-center justify-center py-4">{trigger ? trigger : defaultTrigger}</div>;
}
