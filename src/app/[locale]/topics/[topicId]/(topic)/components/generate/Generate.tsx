import { Button } from '@/components/ui/button';
import useGenerate from '@/hooks/generate/useGenerate';
import { ReactNode, useCallback, useEffect } from 'react';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import { ImportMethod, TypeMethodLeading } from '@/app/[locale]/generate/constants/resource';
import DataStatus from '@/components/errors/DataStatus';
import { isEmpty, isNilOrEmpty, isNullOrEmpty } from '@/utils';
import { toast } from '@/hooks/use-toast';

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
        if (registerNode) return registerNode;
        return <div>Processing ...</div>;
    }

    if (isGenerating) {
        if (generateNode) return generateNode;
        return <div>Generating ...</div>;
    }

    if (!isRegisterGenerate && !isGenerating && apiPostContentError) return <DataStatus variant="error" />;

    const defaultTrigger = <Button onClick={handleStartGenerate}>Generate</Button>;

    return <div>{trigger ? trigger : defaultTrigger}</div>;
}
