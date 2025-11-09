import { Button } from '@/components/ui/button';
import useGenerate from '@/hooks/generate/useGenerate';
import { ReactNode, useCallback } from 'react';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import { ImportMethod, TypeMethodLeading } from '@/app/[locale]/generate/constants/resource';
import DataStatus from '@/components/errors/DataStatus';
import { isNilOrEmpty } from '@/utils';
import { toast } from '@/hooks/use-toast';

interface IProps<TRes> {
    trigger?: ReactNode;
    method?: ImportMethod;
    type: TypeMethodLeading;
    loadingNode?: ReactNode;
    titleTrigger?: string;
    onSuccess?: (data: TRes) => void;
    onError?: (error: any) => void;
}

export default function Generate<TRes>({
    method = 'text',
    type,
    trigger,
    loadingNode,
    onSuccess,
    onError,
}: IProps<TRes>) {
    const { topicId, contentTextOrigin } = useTopicWorkspace();

    const { isGenerating, isRegisterGenerate, apiPostContentError, dataGenerated, execute } = useGenerate<TRes>({
        onSuccess,
        onError,
    });

    const handleStartGenerate = useCallback(async () => {
        if (isNilOrEmpty(contentTextOrigin)) {
            toast({
                description: 'No content prepare',
            });
            return;
        }

        await execute({
            content: contentTextOrigin,
            method,
            type,
        });
    }, [topicId]);

    if (isGenerating || isRegisterGenerate) {
        if (loadingNode) return loadingNode;

        return <div>Generating ...</div>;
    }

    if (!isRegisterGenerate && !isGenerating && apiPostContentError) return <DataStatus variant="error" />;

    const defaultTrigger = <Button onClick={handleStartGenerate}>Generate</Button>;

    return <div>{trigger ? trigger : defaultTrigger}</div>;
}
