import LoadingOverlay from '@/components/loading/LoadingOverLay';
import { TypeImportMethod } from '../../constants/resource';
import { UploadCloud } from 'lucide-react';
import { ALLOWED_AUDIO_TYPES } from '../../constants/validate';

interface UploadItemProps {
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isDragging: boolean;
    isProcessing: (type?: TypeImportMethod | undefined) => boolean;
}

export default function UploadAudioFileInput({
    isDragging,
    isProcessing,
    onDragOver,
    onDragEnter,
    onDragLeave,
    onDrop,
    onFileChange,
}: UploadItemProps) {
    return (
        <div
            className={`mt-4 rounded-3xl p-8 flex flex-col items-center justify-center
                cursor-pointer transition-all
                border border-dashed
                hover:border-primary/60 hover:bg-primary/5
                ${isDragging ? 'border-primary ring-2 ring-primary/30 bg-primary/5' : 'border-muted-foreground/30'}`}
            role="button"
            tabIndex={0}
            onDragOver={onDragOver}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => document.getElementById('audio-file-upload')?.click()}
        >
            {isProcessing() && <LoadingOverlay />}

            <div className="p-4 rounded-full bg-muted mb-4">
                <UploadCloud className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-center mb-1">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground text-center mb-4">MP3</p>

            <input
                id="audio-file-upload"
                type="file"
                className="hidden"
                onChange={onFileChange}
                accept={ALLOWED_AUDIO_TYPES.join(',')}
            />
        </div>
    );
}
