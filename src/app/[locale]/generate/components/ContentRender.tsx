'use client';

import React from 'react';
import FlashcardEditor, { IFlashcardWithServer } from '../../flashcards/components/FlashcardEditor';
import { GeneratedContent } from './ContentGenerationPreview';
import { CONTENT_TYPE_GENERATE } from '../types';

interface ContentRenderProps {
    content: GeneratedContent;
    dataGenerated: object[] | null;
    setDataGenerated: (dataGenerated: object[] | null) => void;
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
                return <MindmapRenderer data={content.data} />;
            default:
                return <div className="p-4 text-center text-gray-500">Unsupported content type: {content.type}</div>;
        }
    };

    return (
        <div className="w-full">
            <div className="mb-4">
                <h3 className="text-lg font-semibold capitalize">Generated {content.type}</h3>
                <p className="text-sm text-gray-600">Review and customize your {content.type} before saving</p>
            </div>
            {renderContent()}
        </div>
    );
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
    data: any;
}

const MindmapRenderer: React.FC<MindmapRendererProps> = ({ data }) => {
    // TODO: Implement mindmap renderer component
    return (
        <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Mindmap Content</h4>
            <p className="text-sm text-gray-600">Mindmap renderer will be implemented here</p>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
};

export default ContentRender;
