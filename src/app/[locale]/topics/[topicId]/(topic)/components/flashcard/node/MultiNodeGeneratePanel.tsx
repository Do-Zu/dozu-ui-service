import { Panel } from '@xyflow/react';
import Generate from '../../generate/Generate';
import useMultiNodeFlashcardsGenerate from '../../../hooks/useMultiNodeFlashcardsGenerate';
import { AppNode } from '@/types/mindmap/mindmap.type';
import { IGenerateNodeFlashcardsItem, IStartGenerateFn, MultiNodeGenerateEnum } from '../../../types/generate.type';
import { Button } from '@/components/ui/button';
import { Layers } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import DefaultGenerateButton from '../../generate/DefaultGenerateButton';
import toastHelper from '@/utils/toast.helper';

interface Props {
    nodes: AppNode[];
    nodeIds: string[];
    onSuccess: ((data: IGenerateNodeFlashcardsItem[]) => void) | undefined;
}

export default function MultiNodeGeneratePanel({ nodes, nodeIds, onSuccess }: Props) {
    const { isVisible, prepareGeneratedData, onHandleBeforeGenerate, onFallBack } = useMultiNodeFlashcardsGenerate({
        nodes,
        nodeIds,
    });

    if (!isVisible) {
        return null;
    }

    async function onGenerateClick(startGenerate: IStartGenerateFn) {
        try {
            const { content, customOptions } = await prepareGeneratedData();
            startGenerate(content, customOptions);
        } catch (err) {
            toastHelper.showErrorMessage(err);
        }
    }

    function getGenerateTrigger(startGenerate: IStartGenerateFn) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="secondary"
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md"
                        onClick={() => onGenerateClick(startGenerate)}
                    >
                        <Layers className="h-4 w-4" />
                        Flashcards
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Generate flashcards</TooltipContent>
            </Tooltip>
        );
    }

    return (
        <Panel position="bottom-left">
            <div className="flex flex-row gap-2">
                <Generate
                    trigger={getGenerateTrigger}
                    customGenerateTrigger={(startGenerate) => (
                        <DefaultGenerateButton onClick={() => onGenerateClick(startGenerate)} />
                    )}
                    type={MultiNodeGenerateEnum.MULTI_NODE_FLASHCARD}
                    onSuccess={onSuccess}
                    onHandleBeforeGenerate={onHandleBeforeGenerate}
                    onFallBack={onFallBack}
                />
            </div>
        </Panel>
    );
}
