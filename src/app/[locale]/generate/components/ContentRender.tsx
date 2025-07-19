'use client';

import React, { useState } from 'react';
import FlashcardEditor, { IFlashcardWithServer } from '../../flashcards/components/FlashcardEditor';
import { GeneratedContent, TypeDataGenerated } from './ContentGenerationPreview';
import { CONTENT_TYPE_GENERATE } from '../types';
import GenerateMindmapCard from '../../mindmap/components/GenerateMindmapCard';

interface ContentRenderProps {
    content: GeneratedContent;
    dataGenerated: TypeDataGenerated;
    setDataGenerated: (dataGenerated: TypeDataGenerated) => void;
}

const ContentRender: React.FC<ContentRenderProps> = ({ content, dataGenerated, setDataGenerated }) => {
    const renderContent = () => {
        switch (content.type) {
            case CONTENT_TYPE_GENERATE.FLASH_CARD:
                return (
                    <FlashcardRenderer
                        flashcards={dataGenerated as IFlashcardWithServer[]}
                        setFlashcards={setDataGenerated}
                    />
                );
            case CONTENT_TYPE_GENERATE.QUIZ || CONTENT_TYPE_GENERATE.MULTIPLE_CHOICE:
                return <QuizRenderer data={content.data} />;
            case CONTENT_TYPE_GENERATE.MIND_MAP:
                return <MindmapRenderer data={content.data} setDataGenerated={setDataGenerated} />;
            default:
                return <div className="p-4 text-center text-gray-500">Unsupported content type: {content.type}</div>;
        }
    };

    return <div className="w-full">{renderContent()}</div>;
};

// Individual content type renderers
interface FlashcardRendererProps {
    flashcards: IFlashcardWithServer[] | null;
    setFlashcards: (flashcards: IFlashcardWithServer[] | null) => void;
}

const FlashcardRenderer: React.FC<FlashcardRendererProps> = ({ flashcards, setFlashcards }) => {
    if (!flashcards) {
        return <div className="p-4 text-center text-gray-500">No flashcards generated</div>;
    }

    return (
        <FlashcardEditor
            flashcards={flashcards}
            setFlashcards={setFlashcards}
            shouldShowBackButton={false}
            shouldShowSaveButton={false}
        />
    );
};

interface QuizRendererProps {
    //TODO: Define the structure of quiz data
    data: any;
}

const QuizRenderer: React.FC<QuizRendererProps> = ({ data }) => {
    // TODO: Implement quiz renderer component
    return (
        <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Quiz Content</h4>
            <p className="text-sm text-gray-600">Quiz renderer will be implemented here</p>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
};

interface MindmapRendererProps {
    //TODO: Define the structure of mindmap data
    data: any;
    setDataGenerated: (data: any) => void;
    //original is object[] but mindmapData is object so it doesn't work, changing requires changing useContentGeneration hook
    // and that's too hard - DuyND
}

const MindmapRenderer: React.FC<MindmapRendererProps> = ({ data, setDataGenerated }) => {
    const [topicName, setTopicName] = useState<string>('');

    // TODO: Implement mindmap renderer component
    return (
        <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Mindmap Content</h4>

            <GenerateMindmapCard
                mindmapData={data}
                topicName={topicName}
                setTopicName={setTopicName}
                setDataGenerated={setDataGenerated}
            />
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
};

export default ContentRender;
