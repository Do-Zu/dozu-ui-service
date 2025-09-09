import { Button } from '@/components/ui/button';
import { File } from 'lucide-react';
import React from 'react';
import { useMindMapContext } from '../../context/MindMapContext';

const ViewFileButton = () => {
    const { isFileSheetOpen, setIsFileSheetOpen } = useMindMapContext();

    const handleClickViewFile = () => {
        setIsFileSheetOpen(!isFileSheetOpen);
    };

    return (
        <Button variant="outline" onClick={handleClickViewFile}>
            <File />
        </Button>
    );
};

export default ViewFileButton;
