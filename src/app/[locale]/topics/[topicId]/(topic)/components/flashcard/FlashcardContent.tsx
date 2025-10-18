'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, ChevronDown, GraduationCap, LayoutGrid } from 'lucide-react';
import { use, useEffect, useState } from 'react';
import FlashcardBrowse from './browse/FlashcardBrowse';
import { useParams } from 'next/navigation';
import FlashcardLearning from './learning/FlashcardLearning';
import { useSelector } from 'react-redux';
import {
    fetchFlashcards,
    selectFlashcards,
    selectFlashcardsError,
    selectFlashcardsStatus,
} from '../../store/features/flashcardSlice';
import { useTopicDispatch } from '../../hooks/hooks';
import { UserTrackingProvider } from '@/contexts/tracking/UserTrackingContext';
import FetchBoundary from '@/components/common/FetchBoundary2';
import {
    fetchLearningFlashcards,
    selectLearningFlashcards,
    selectLearningFlashcardsError,
    selectLearningFlashcardsStatus,
} from '../../store/features/learningFlashcardSlice';
import FlashcardsEmptyState from './browse/FlashcardsEmptyState';
import LearningFlashcardsEmptyState from './learning/LearningFlashcardsEmptyState';
import { selectFlashcardCounts } from '../../store/features/topicDetailsSlice';

export type FlashcardLearningMode = 'browse' | 'learning';

export default function FlashcardContent() {
    const params = useParams<{ topicId: string }>();
    const topicId = Number(params?.topicId);

    const dispatch = useTopicDispatch();

    // flashcards for browsing
    const flashcardsError = useSelector(selectFlashcardsError);
    const flashcardsStatus = useSelector(selectFlashcardsStatus);
    const flashcards = useSelector(selectFlashcards);

    // flashcards for learning
    const learningFlashcardsError = useSelector(selectLearningFlashcardsError);
    const learningFlashcardsStatus = useSelector(selectLearningFlashcardsStatus);
    const learningFlashcards = useSelector(selectLearningFlashcards);

    // card status counts
    const flashcardCounts = useSelector(selectFlashcardCounts);

    const [mode, setMode] = useState<FlashcardLearningMode>('browse');

    useEffect(() => {
        if (flashcardsStatus === 'idle') {
            dispatch(fetchFlashcards(topicId));
        }
    }, [topicId, flashcardsStatus, dispatch]);

    useEffect(() => {
        if (learningFlashcardsStatus === 'idle') {
            dispatch(fetchLearningFlashcards(topicId));
        }
    }, [topicId, learningFlashcardsStatus, dispatch]);

    if (isNaN(topicId)) {
        return <div className="p-8">TopicId is not valid, please try again.</div>;
    }

    function handleModeSelect(mode: FlashcardLearningMode) {
        setMode(mode);
    }

    return (
        <div className="w-full h-[95%]">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                        <span>{mode === 'browse' ? 'Browse' : 'Learning'}</span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => handleModeSelect('browse')}>
                        <LayoutGrid className="mr-2 h-4 w-4" />
                        <span>Browse</span>
                        {mode === 'browse' && <Check className="ml-auto h-4 w-4" />}
                    </DropdownMenuItem>

                    <DropdownMenuItem onSelect={() => handleModeSelect('learning')}>
                        <GraduationCap className="mr-2 h-4 w-4" />
                        <span>Learning</span>
                        {mode === 'learning' && <Check className="ml-auto h-4 w-4" />}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {mode === 'browse' ? (
                <FetchBoundary
                    data={flashcards}
                    status={flashcardsStatus}
                    error={flashcardsError}
                    onEmpty={<FlashcardsEmptyState />}
                >
                    {(flashcards) => <FlashcardBrowse topicId={topicId} flashcards={flashcards} />}
                </FetchBoundary>
            ) : null}
            {mode === 'learning' ? (
                <UserTrackingProvider
                    autoStartTracking={true}
                    enableAutoSend={true} // Disable auto-send to prevent duplicate API calls - handleSaveTrackingProgressLearning() handles this
                    minSessionTime={5000} // 5 seconds minimum session
                    apiEndpoint="/tracking/active-learning" // Behavioral tracking
                    learningApiEndpoint="/progress/learning-tracking" // Learning progress tracking
                >
                    <FetchBoundary
                        data={learningFlashcards}
                        status={learningFlashcardsStatus}
                        error={learningFlashcardsError}
                        onEmpty={<LearningFlashcardsEmptyState topicId={topicId} />}
                    >
                        {(learningFlashcards) => (
                            <FlashcardLearning
                                topicId={topicId.toString()}
                                flashcards={learningFlashcards}
                                ankiCardStatusCounts={flashcardCounts || { new: 0, learning: 0, review: 0 }}
                            />
                        )}
                    </FetchBoundary>
                </UserTrackingProvider>
            ) : null}
        </div>
    );
}
