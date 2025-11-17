import { useState } from 'react';

export default function usePdfToolBar() {
    const [isPdfViewerFullscreen, setIsPdfViewerFullScreen] = useState<boolean>(false);
    const [pageNumber, setPageNumber] = useState<number>(1);

    return {
        pageNumber,
        setPageNumber,
        isPdfViewerFullscreen,
        setIsPdfViewerFullScreen,
    };
}
