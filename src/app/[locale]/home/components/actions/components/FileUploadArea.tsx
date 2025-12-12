import { useEffect, useState } from 'react';
import { Upload, X, File } from 'lucide-react';

interface FileUploadAreaProps {
    files?: File[];
    handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    handleDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
    handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUploadArea: React.FC<FileUploadAreaProps> = ({
    files,
    handleDrop,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
}) => {
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const handleGlobalDragEnter = (e: DragEvent) => {
            e.preventDefault();
            if (e.dataTransfer?.types.includes('Files')) {
                setIsDragging(true);
            }
        };

        const handleGlobalDragLeave = (e: DragEvent) => {
            e.preventDefault();
            // Check if we're leaving the document (not just an element)
            if (e.clientX <= 0 || e.clientY <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
                setIsDragging(false);
            }
        };

        const handleGlobalDrop = () => {
            setIsDragging(false);
        };

        document.addEventListener('dragenter', handleGlobalDragEnter);
        document.addEventListener('dragleave', handleGlobalDragLeave);
        document.addEventListener('drop', handleGlobalDrop);

        return () => {
            document.removeEventListener('dragenter', handleGlobalDragEnter);
            document.removeEventListener('dragleave', handleGlobalDragLeave);
            document.removeEventListener('drop', handleGlobalDrop);
        };
    }, []);

    return (
        <>
            {/* Full-screen overlay when dragging */}
            {isDragging && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={(e) => {
                        handleDragLeave(e);
                        // Only hide overlay if actually leaving the document
                        if (
                            e.clientX <= 0 ||
                            e.clientY <= 0 ||
                            e.clientX >= window.innerWidth ||
                            e.clientY >= window.innerHeight
                        ) {
                            setIsDragging(false);
                        }
                    }}
                    onDrop={(e) => {
                        handleDrop(e);
                        setIsDragging(false);
                    }}
                >
                    <div className="bg-slate-200 dark:bg-slate-600 p-12 rounded-lg border-1 border-dashed text-center">
                        <Upload className="h-20 w-20 mx-auto mb-6" />
                        <h2 className="text-gray-500 dark:text-gray-100 text-2xl font-bold mb-2">
                            Drop your file here
                        </h2>
                        <p className="text-gray-600">Release to upload</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default FileUploadArea;
