'use client';

import React from 'react';
import { TopicModal } from '../../topics/components/TopicModal';
import { TopicCreatedForm } from '../../topics/components/TopicCreatedForm';
import { ISseData } from '../types';
import { IFlashcardWithServer } from '../../flashcards/components/FlashcardEditor';
import { detectContentType } from '../utils/contentTypeDetector';
import ContentRenderer from './ContentRenderer';

export type ContentType = 'flashcard' | 'quiz' | 'mindmap';

export interface GeneratedContent {
    type: ContentType;
    data: any;
}

interface ContentGenerationPreviewProps {
    sseData: ISseData | null;
    dataGenerated: object[] | null;
    setDataGenerated: (flashcards: IFlashcardWithServer[] | null | object[]) => void;
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
            <TopicModal
                title="Create New Content"
                body={
                    <TopicCreatedForm
                        name={topicName}
                        setName={setTopicName}
                        description={topicDescription}
                        setDescription={setTopicDescription}
                        handleOnClickCreate={onSave}
                    />
                }
                isOpen={isTopicModalOpen}
                setIsOpen={setIsTopicModalOpen}
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
