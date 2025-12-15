'use client';

import React from 'react';
import { Modal } from '@/components/modal/Modal';
import { useActionStore } from './context/ActionContext';
import useUploadAudioFile from './hooks/useUploadAudioFile';
import UploadAudioFileInput from './components/upload/UploadAudioFileInput';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RecordTab from './components/record/RecordTab';

export const MediaModal: React.FC = () => {
    const { showMedia: isOpen, setShowMedia: setIsOpen, isProcessing } = useActionStore((state) => state);

    const { isDragging, handleDragOver, handleDragEnter, handleDragLeave, handleFileChange, handleDrop } =
        useUploadAudioFile();

    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            body={
                <div className="w-full flex-col p-4">
                    <Tabs className="w-full">
                        <TabsList className="w-full flex">
                            <TabsTrigger value="upload" className="flex-1 flex items-center justify-center">
                                Upload
                            </TabsTrigger>

                            <TabsTrigger value="record" className="flex-1 flex items-center justify-center">
                                Record
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="upload">
                            <UploadAudioFileInput
                                onDragOver={handleDragOver}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onFileChange={handleFileChange}
                                isDragging={isDragging}
                                isProcessing={isProcessing}
                            />
                        </TabsContent>

                        <TabsContent value="record">
                            <RecordTab />
                        </TabsContent>
                    </Tabs>
                </div>
            }
            contentStyle="top-[20%] left-[50%] max-w-[40vw] h-[60vh] -translate-x-1/2 -translate-y-0"
        />
    );
};
