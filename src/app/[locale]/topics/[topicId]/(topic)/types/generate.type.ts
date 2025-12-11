import { CustomNodeData } from '@/types/mindmap/mindmap.type';
import { IResponseFlashCardGenerate } from '../hooks/useFlashCardWorkSpace';
import { TypeMethodLearning } from '@/utils/constants/method';

export interface ICustomOptions {
    nodesData?: NodesData;
}

export type NodesData = (Pick<CustomNodeData, 'nodeId' | 'label' | 'description'> & {
    startSection: string;
    endSection: string;
})[];

export interface IGenerateNodeFlashcardsItem {
    nodeId: string;
    flashcards: IResponseFlashCardGenerate[];
}
export enum MultiNodeGenerateEnum {
    MULTI_NODE_FLASHCARD = 'multi_node_flashcard',
}
export type IMultiNodeGenerateType = 'multi_node_flashcard';

export type IGenerateType =
    | Extract<TypeMethodLearning, 'flashcard' | 'quiz' | 'mindmap' | 'short_summary'>
    | IMultiNodeGenerateType;

export type IStartGenerateFn = (content?: string, options?: ICustomOptions) => void;
