'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Upload, Link, Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import { UploadModal } from './UploadModal';
import { PasteLinkModal } from './PasteLinkModal';
import { RecordModal } from './RecordModal';
import { ActionProvider, useActionStore } from './context/ActionContext';
import { IMPORT_METHOD, TypeImportMethod } from './constants/resource';
import LoadingOverlay from '@/components/loading/LoadingOverLay';

function ActionsContent() {
    const setShowUpload = useActionStore((state) => state.setShowUpload);
    const setShowLink = useActionStore((state) => state.setShowLink);
    const setShowRecord = useActionStore((state) => state.setShowRecord);
    const isProcessing = useActionStore((state) => state.isProcessing);

    const actions: {
        title: string;
        description: string;
        icon: typeof Upload;
        onClick: () => void;
        delay: number;
        type: TypeImportMethod;
    }[] = [
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
            title: 'Record',
            description: 'Class, video call',
            icon: Mic,
            onClick: () => setShowRecord(true),
            delay: 0.3,
            type: IMPORT_METHOD.MEDIA,
        },
    ];

    return (
        <div className="w-full max-w-3xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {actions.map((action, index) => {
                    const isCardProcessing = isProcessing(action.type);
                    const isAnyProcessing = isProcessing();
                    const isDisabled = isAnyProcessing;

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: action.delay }}
                            className="relative"
                        >
                            <Card
                                className={`max-w-[250px] border-0.5 dark:border-2 dark:border-slate-900/50 px-2 py-6 rounded-[3em] cursor-pointer shadow-md dark:hover:shadow-md transition-all hover:border-primary/10 group h-full flex flex-col items-center justify-center text-center gap-4 bg-card/50 backdrop-blur-lg overflow-hidden ${
                                    isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                                }`}
                                onClick={isDisabled ? undefined : action.onClick}
                            >
                                <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20  group-hover:text-primary transition-colors">
                                    <action.icon className="w-4 h-4 " />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-sm">{action.title}</h3>
                                    <p className="text-xs text-muted-foreground">{action.description}</p>
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
