import { CustomNodeData } from '@/types/mindmap/mindmap.type';
import { IResponseFlashCardGenerate } from '../hooks/useFlashCardWorkSpace';

export type PreparedData = {
    customContent?: string;
    customOptions?: NodesData;
};

export type GetPreparedData = () => PreparedData | Promise<PreparedData>;

export type NodesData = (Pick<CustomNodeData, 'nodeId' | 'label' | 'description'> & {
    startSection: string;
    endSection: string;
})[];

export type LearningGenerationOptions = {
    numberOfItem: number;
    difficulty: string;
    focus: string;
    listType: string[];
};

export interface IGenerateNodeFlashcardsItem {
    nodeId: string;
    flashcards: Pick<IResponseFlashCardGenerate, 'q' | 'a'>[];
}
