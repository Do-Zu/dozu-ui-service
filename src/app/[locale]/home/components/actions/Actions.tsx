'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Upload, Link, Mic, FileVolume, AudioLines } from 'lucide-react';
import { motion } from 'framer-motion';
import { UploadModal } from './UploadModal';
import { PasteLinkModal } from './PasteLinkModal';
import { RecordModal } from './RecordModal';
import { ActionProvider, useActionStore } from './context/ActionContext';
import { IMPORT_METHOD, TypeImportMethod } from './constants/resource';
import LoadingOverlay from '@/components/loading/LoadingOverLay';
import { compareIgnoreCapitalization } from '@/utils';

interface IActionCard {
    title: string;
    description: string;
    icon: typeof Upload;
    onClick: () => void;
    delay: number;
    type: TypeImportMethod;
}

function ActionsContent() {
    const { isProcessing, processingType, setShowLink, setShowRecord, setShowUpload } = useActionStore(
        (state) => state,
    );

    const actions: IActionCard[] = useMemo(() => {
        return [
            {
                title: 'Upload',
                description: 'PDF, Doc, Txt',
                icon: Upload,
                onClick: () => setShowUpload(true),
                delay: 0.1,
                type: IMPORT_METHOD.FILE,
            },
            {
                title: 'Paste',
                description: 'YouTube, website, text',
                icon: Link,
                onClick: () => setShowLink(true),
                delay: 0.2,
                type: IMPORT_METHOD.TEXT,
            },
            {
                title: 'Media',
                description: 'Upload audio files or record audio',
                icon: AudioLines,
                onClick: () => setShowRecord(true),
                delay: 0.3,
                type: IMPORT_METHOD.MEDIA,
            },
        ];
    }, []);

    const isDisabled = isProcessing();

    return (
        <div className="w-full max-w-3xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {actions?.map((action, index) => {
                    const isCardProcessing =
                        isDisabled && processingType && compareIgnoreCapitalization(processingType, action?.type);

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: action.delay }}
                            className="relative h-full"
                        >
                            <Card
                                className={`
                                relative h-full flex flex-col items-center justify-center text-center gap-5 px-4 py-8
                                rounded-3xl border transition-all duration-300 ease-out group overflow-hidden
                                ${
                                    isDisabled
                                        ? 'opacity-60 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50'
                                        : 'cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 border-slate-200/60 dark:border-slate-700/50 hover:border-primary/30 dark:hover:border-primary/50 bg-gradient-to-b from-white to-slate-50 dark:from-slate-800/40 dark:to-slate-900/40 backdrop-blur-md'
                                }
                            `}
                                onClick={isDisabled ? undefined : action.onClick}
                            >
                                {!isDisabled && (
                                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                )}

                                <div
                                    className={`
                                relative p-4 rounded-2xl transition-all duration-300
                                ${
                                    isDisabled
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                        : 'bg-primary/5 text-primary ring-1 ring-primary/20 group-hover:bg-primary group-hover:text-white group-hover:ring-primary group-hover:shadow-lg group-hover:shadow-primary/30'
                                }
                            `}
                                >
                                    <action.icon className="w-6 h-6" />
                                </div>

                                <div className="space-y-1.5 relative z-10">
                                    <h3
                                        className={`font-bold text-base transition-colors ${!isDisabled ? 'group-hover:text-primary dark:text-slate-100' : 'text-slate-500'}`}
                                    >
                                        {action.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground/80 font-medium leading-relaxed px-2">
                                        {action.description}
                                    </p>
                                </div>

                                {isCardProcessing && <LoadingOverlay />}
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            <UploadModal />
            <PasteLinkModal />
            <RecordModal />
        </div>
    );
}

export default function Actions() {
    return (
        <ActionProvider>
            <ActionsContent />
        </ActionProvider>
    );
}
