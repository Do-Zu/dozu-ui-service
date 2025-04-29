import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, Link, Video, Upload, File, Mic } from 'lucide-react';
import { setActiveTab } from '@/stores/features/content-extraction/contentExtractionSlice';
import { setImportMethod } from '@/stores/features/import-dialog/importDialogSlice';
import TabContent from '../import/components/TextUrlContentTab';

interface SelectMethodImportProps {
  className?: string;
}

export const SelectMethodImport = ({ className }: SelectMethodImportProps) => {
  const dispatch = useDispatch();
  const [files, setFiles] = useState<File[]>([]);
  const [importMethod, setImportMethodState] = useState('file');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs
        defaultValue="file"
        value={importMethod}
        onValueChange={(value) => {
          dispatch(setImportMethod(value));
          dispatch(setActiveTab(value));
        }}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="file" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Files</span>
          </TabsTrigger>
          <TabsTrigger value="text" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            <span>URL</span>
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            <span>Media</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="mt-4">
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center hover:opacity-70 transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
            />
            <Upload className="h-10 w-10 mx-auto mb-4" />
            <h3 className="font-medium mb-1">Drag & drop files here</h3>
            <p className="text-sm mb-2">or click to browse your files</p>
            <p className="text-xs">Supports PDF, Word, and text files</p>

            {files.length > 0 && (
              <div className="mt-4 text-left">
                <h4 className="text-sm font-medium mb-2">Selected files:</h4>
                <ul className="space-y-1">
                  {files.map((file, index) => (
                    <li key={index} className="text-sm flex items-center">
                      <File className="h-4 w-4 mr-2" />
                      {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="text" className="mt-4">
          <TabContent />
        </TabsContent>

        <TabsContent value="media" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div
              className="border-2 border-dashed border-border rounded-lg p-6 text-center transition-colors cursor-pointer"
              onClick={() => document.getElementById('audio-upload')?.click()}
            >
              <input id="audio-upload" type="file" className="hidden" accept="audio/*" />
              <Mic className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-medium text-sm mb-1">Upload Audio</h3>
              <p className="text-xs">MP3, WAV, M4A files</p>
            </div>

            <div
              className="border-2 border-dashed border-border rounded-lg p-6 text-center transition-colors cursor-pointer"
              onClick={() => document.getElementById('video-upload')?.click()}
            >
              <input id="video-upload" type="file" className="hidden" accept="video/*" />
              <Video className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-medium text-sm mb-1">Upload Video</h3>
              <p className="text-xs">MP4, MOV, AVI files</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Note: Audio and video content will be processed to extract learning material.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SelectMethodImport;
