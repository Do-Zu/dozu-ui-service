import { Button } from '@/components/ui/button';
import { File } from 'lucide-react';
import React from 'react';

interface INodeSheetParams {
    setIsFileSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ViewFileButton = ({ setIsFileSheetOpen }: INodeSheetParams) => {
    const handleClickViewFile = () => {
        setIsFileSheetOpen((isFileSheetOpen) => !isFileSheetOpen);
    };
    return (
        <Button variant="outline" onClick={handleClickViewFile}>
            <File />
        </Button>
    );
};

export default ViewFileButton;
