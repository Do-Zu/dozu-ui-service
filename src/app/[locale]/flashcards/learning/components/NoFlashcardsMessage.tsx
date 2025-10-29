'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface NoFlashcardsMessageProps {
    hasStudied: boolean;
    initialFlashcardCount: number | null;
    sessionStats: {
        cardsReviewed: number;
        correctAnswers: number;
        pointsEarned: number;
    };
    onGoBack: () => void;
}

export default function NoFlashcardsMessage({
    hasStudied,
    initialFlashcardCount,
    sessionStats,
    onGoBack,
}: NoFlashcardsMessageProps) {
    const tFlashcardLearning = useTranslations('flashcard.learning');
    
    const isActuallyCompleted = hasStudied && initialFlashcardCount !== null && initialFlashcardCount > 0;
    const hasNoFlashcards = initialFlashcardCount === 0;

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                    {isActuallyCompleted ? (
                        <CheckCircle className="w-8 h-8 text-green-600" aria-hidden="true" />
                    ) : (
                        <BookOpen className="w-8 h-8 text-gray-400" aria-hidden="true" />
                    )}
                </div>
                
                {isActuallyCompleted ? (
                    <>
                        <h2 className="text-2xl font-semibold text-black flex items-center gap-2">
                            {tFlashcardLearning('greatJob')}
                            <span className="text-2xl">🎉</span>
                        </h2>
                        <p className="text-gray-700 max-w-md">
                            {tFlashcardLearning('flashcardsCompleted')}
                        </p>
                    </>
                ) : hasNoFlashcards ? (
                    <>
                        <h2 className="text-2xl font-semibold text-gray-600 flex items-center gap-2">
                            <AlertCircle className="w-6 h-6" aria-hidden="true" />
                            {tFlashcardLearning('noFlashcardsAvailable')}
                        </h2>
                        <p className="text-gray-700 max-w-md">
                            {tFlashcardLearning('noFlashcardsAvailableBody')}
                        </p>
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-semibold text-gray-600 flex items-center gap-2">
                            <BookOpen className="w-6 h-6" aria-hidden="true" />
                            {tFlashcardLearning('noFlashcardsToStudy')}
                        </h2>
                        <p className="text-gray-700 max-w-md">
                            {tFlashcardLearning('noFlashcardsToStudyBody')}
                        </p>
                    </>
                )}
                
                {/* Session Summary - Only show if user actually studied */}
                {isActuallyCompleted && sessionStats.cardsReviewed > 0 && (
                    <Card className="mt-6 w-full max-w-md">
                        <CardContent className="pt-6">
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-center">{tFlashcardLearning('sessionSummaryTitle')}</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{tFlashcardLearning('cardsReviewedLabel')}</span>
                                        <span className="font-semibold">{sessionStats.cardsReviewed}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{tFlashcardLearning('correctAnswersLabel')}</span>
                                        <span className="font-semibold text-green-600">{sessionStats.correctAnswers}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{tFlashcardLearning('pointsEarnedLabel')}</span>
                                        <span className="font-semibold text-yellow-600">+{sessionStats.pointsEarned}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{tFlashcardLearning('accuracyLabel')}</span>
                                        <span className="font-semibold">
                                            {sessionStats.cardsReviewed > 0 
                                                ? Math.round((sessionStats.correctAnswers / sessionStats.cardsReviewed) * 100)
                                                : 0}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
                
                <div className="pt-4">
                    <Button
                        type="button"
                        onClick={onGoBack}
                        className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors border border-gray-300"
                    >
                        {tFlashcardLearning('goBack')}
                    </Button>
                </div>
            </div>
        </div>
    );
}

