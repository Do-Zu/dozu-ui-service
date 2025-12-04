'use client';

import React from 'react';
import { ISseData } from '../types';
import { IFlashcardWithServer } from '../../flashcards/components/FlashcardEditor';
import { detectContentType } from '../utils/contentTypeDetector';
import { IQuestion } from '../../question/types/question.type';
import ContentRenderer from './ContentRender';
import { CreateTopicModal } from '../../topics/components/modals/CreateTopicModal';
import { ICreateTopicPayload } from '@/services/topic/topic.service';
import { ICreateClassFeedBody } from '@/services/class-based-learning/classFeed.service';
import CreateFeedModal, { IDefaultFeed } from '../../teacher/feeds/components/modals/CreateFeedModal';
import { useCardImportSelector } from '../hooks/useReduxStore';
import { safeDestructure } from '@/utils';

export type ContentType = 'flashcard' | 'quiz' | 'mindmap';

export interface GeneratedContent {
    type: ContentType;
    data: any;
}

export type TypeDataGenerated = IFlashcardWithServer[] | IQuestion[] | object[] | object | null;

type ContentGenerationPreviewProps = GenerateContentForNodeProps | GenerateContentForTopicProps;

interface BaseContentGenerationProps {
    sseData: ISseData | null;
    dataGenerated: TypeDataGenerated;
    setDataGenerated: (data: TypeDataGenerated) => void;
}

// type for generating content for a topic
interface GenerateContentForTopicProps extends BaseContentGenerationProps {
    shouldCreateTopic: true;
    isTopicModalOpen: boolean;
    setIsTopicModalOpen: (open: boolean) => void;
    onSave: (topic: ICreateTopicPayload) => Promise<void>;

    shouldCreateFeed?: boolean;
    isFeedModalOpen?: boolean;
    setIsFeedModalOpen?: (open: boolean) => void;
    openFeedModal?: () => void;
    onSaveFeed?: (feed: ICreateClassFeedBody) => Promise<void>;
    defaultFeed?: IDefaultFeed | null;
    onCancelFeed?: () => void;
}

// type for generating flashcards for a node
interface GenerateContentForNodeProps extends BaseContentGenerationProps {
    shouldCreateTopic: false;
    shouldCreateFeed: false;
    onSave: () => Promise<void>;
}

const ContentGenerationPreview: React.FC<ContentGenerationPreviewProps> = (props) => {
    const { shouldCreateTopic, sseData, dataGenerated, setDataGenerated, onSave } = props;
    const { isUploading } = safeDestructure(useCardImportSelector((state) => state.importDialog));
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
            {shouldCreateTopic === true ? (
                <>
                    <CreateTopicModal
                        isOpen={props.isTopicModalOpen}
                        setIsOpen={props.setIsTopicModalOpen}
                        onSubmit={onSave}
                        loading={isUploading}
                    />
                    {props.shouldCreateFeed === true &&
                    props.isFeedModalOpen &&
                    props.setIsFeedModalOpen &&
                    props.onSaveFeed &&
                    props.onCancelFeed ? (
                        <CreateFeedModal
                            isOpen={props.isFeedModalOpen}
                            setIsOpen={props.setIsFeedModalOpen}
                            onSubmit={props.onSaveFeed}
                            defaultFeed={props.defaultFeed}
                            type="system"
                            onCancel={props.onCancelFeed}
                        />
                    ) : null}
                </>
            ) : null}

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
