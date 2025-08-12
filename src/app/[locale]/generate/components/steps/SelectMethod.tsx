'use client';

import React, { useMemo } from 'react';
import { Sparkles, BookOpen, FileText, Lightbulb, Check, Map } from 'lucide-react';
import { useCardImportSelector, useCardImportDispatch } from '../../hooks/useReduxStore';
import { setSelectedMethod } from '@/app/[locale]/generate/stores/features/importDialogSlice';
import { useTranslations } from 'next-intl';

interface SelectMethodProps {}

const SelectMethod: React.FC<SelectMethodProps> = () => {
    const dispatch = useCardImportDispatch();
    const t = useTranslations('generate.selectMethod');
    const { suggestedMethods, selectedMethod, importMethod } = useCardImportSelector((state) => state.importDialog);

    const handleMethodSelection = (method: string) => {
        dispatch(setSelectedMethod(method));
    };

    // Method icon mapping
    const getMethodIcon = (method: string) => {
        switch (method) {
            case 'flashcards':
                return <BookOpen className="h-5 w-5" />;
            case 'quiz':
                return <Lightbulb className="h-5 w-5" />;
            case 'mindmap':
                return <Map className="h-5 w-5" />;
            default:
                return <FileText className="h-5 w-5" />;
        }
    };

    // Method description mapping
    const getMethodDescription = (method: string) => {
        switch (method) {
            case 'flashcards':
                return t('descriptions.flashcards');
            case 'quiz':
                return t('descriptions.quiz');
            case 'mindmap':
                return t('descriptions.mindmap');
            default:
                return t('descriptions.default');
        }
    };

    const suggestMethodSelection = useMemo(() => {
        if (importMethod === 'file') {
            return suggestedMethods;
        }
        // Exclude mindmap if importMethod is not 'file'
        return suggestedMethods.filter((method) => method !== 'mindmap');
    }, [selectedMethod]);

    return (
        <div className="space-y-6">
            <div className="p-4 rounded-lg border">
                <div className="flex items-start gap-3">
                    <div className="bg-primary p-2 rounded-full">
                        <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-medium mb-1">{t('header.title')}</h3>
                        <p className="text-sm text-muted-foreground">{t('header.description')}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {suggestMethodSelection?.map((method) => (
                    <div
                        key={method}
                        className={`p-4 rounded-lg border ${selectedMethod === method ? 'border-border bg-muted' : 'border-border'} cursor-pointer transition-all`}
                        onClick={() => handleMethodSelection(method)}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {getMethodIcon(method)}
                                <div>
                                    <h4 className="font-medium capitalize">{t(`methods.${method}`)}</h4>
                                    <p className="text-sm">{getMethodDescription(method)}</p>
                                </div>
                            </div>
                            <div
                                className={`w-5 h-5 rounded-full border ${selectedMethod === method ? 'bg-muted border-border' : 'border-border'} flex items-center justify-center`}
                            >
                                {selectedMethod === method && <Check className="h-3 w-3 text-foreground" />}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SelectMethod;
