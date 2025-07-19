'use client';

import React from 'react';
import { ISseData } from '../types';
import { IFlashcardWithServer } from '../../flashcards/components/FlashcardEditor';
import { detectContentType } from '../utils/contentTypeDetector';
import ContentRenderer from './ContentRender';
import { CreateTopicModal } from '../../topics/components/CreateTopicModal';

export type ContentType = 'flashcard' | 'quiz' | 'mindmap';

export interface GeneratedContent {
    type: ContentType;
    data: any;
}

export type TypeDataGenerated = IFlashcardWithServer[] | object[] | object | null;

interface ContentGenerationPreviewProps {
    sseData: ISseData | null;
    dataGenerated: TypeDataGenerated;
    setDataGenerated: (data: TypeDataGenerated) => void;
    topicName: string;
    setTopicName: (name: string) => void;
    topicDescription: string;
    setTopicDescription: (description: string) => void;
    isTopicModalOpen: boolean;
    setIsTopicModalOpen: (open: boolean) => void;
    onSave: () => Promise<void>;
}

const ContentGenerationPreview: React.FC<ContentGenerationPreviewProps> = ({
    sseData,
    dataGenerated,
    setDataGenerated,
    topicName,
    setTopicName,
    topicDescription,
    setTopicDescription,
    isTopicModalOpen,
    setIsTopicModalOpen,
    onSave,
}) => {
    // Determine content type based on sseData or other criteria
    const getContentType = (): ContentType | null => {
        return detectContentType(sseData);
    };

    const getGeneratedContent = (): GeneratedContent | null => {
        if (!sseData?.data?.data) return null;

        const contentType = getContentType();

        if (!contentType) return null;

        return {
            type: contentType,
            data: sseData?.data?.data,
        };
    };

    const generatedContent = getGeneratedContent();

    return (
        <div className="space-y-4">
            <CreateTopicModal
                isOpen={isTopicModalOpen}
                setIsOpen={setIsTopicModalOpen}
                name={topicName}
                setName={setTopicName}
                description={topicDescription}
                setDescription={setTopicDescription}
                handleCreateClick={onSave}
            />

            {generatedContent && (
                <ContentRenderer
                    content={generatedContent}
                    dataGenerated={dataGenerated}
                    setDataGenerated={setDataGenerated}
                />
            )}
        </div>
    );
};

export default ContentGenerationPreview;
