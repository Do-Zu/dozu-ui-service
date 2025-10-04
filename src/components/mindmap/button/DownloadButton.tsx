import { Button } from '@/components/ui/button';
import { getNodesBounds, getViewportForBounds, useReactFlow } from '@xyflow/react';
import { FileDown } from 'lucide-react';
import React from 'react';
import { toPng } from 'html-to-image';
import { toast } from '@/hooks/use-toast';

function downloadImage(dataUrl: string) {
    const a = document.createElement('a');

    a.setAttribute('download', 'reactflow.png');
    a.setAttribute('href', dataUrl);
    a.click();
}

const imageWidth = 3840;//hardcoded, change later if needed - DuyND
const imageHeight = 2160;

const DownloadButton = () => {
    const { getNodes } = useReactFlow();
    const onClick = () => {
        // we calculate a transform for the nodes so that all nodes are visible
        // we then overwrite the transform of the `.react-flow__viewport` element
        // with the style option of the html-to-image library
        const nodesBounds = getNodesBounds(getNodes());
        const viewport = getViewportForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2, 1);
        const mindmapElement = document.querySelector('.react-flow__viewport') as HTMLElement | null;

        if (!mindmapElement) {
            toast({ description: 'Error downloading' });
            return;
        }

        toPng(mindmapElement, {
            backgroundColor: '#d9dddc',
            width: imageWidth, //of result image
            height: imageHeight,
            style: {
                width: imageWidth.toString(),
                height: imageHeight.toString(),
                transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
            },
        }).then(downloadImage);
    };

    return (
        <Button variant="outline" onClick={onClick}>
            <FileDown />
            Download mindmap
        </Button>
    );
};

export default DownloadButton;
