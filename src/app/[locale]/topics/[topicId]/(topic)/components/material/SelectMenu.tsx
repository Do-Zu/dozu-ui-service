'use client';

import { useEffect, useState, RefObject, memo, useMemo, CSSProperties } from 'react';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import useSelectMenu from '../../hooks/useSelectMenu';

interface Props {
    refNode: RefObject<HTMLDivElement>;
}

interface Position {
    left: number;
    top: number;
    width: number;
    height: number;
}

type State = 'idle' | 'selecting' | 'selected';
type SelectionDirection = 'forward' | 'backward';
const selectMenuWidth = 200;
const selectMenuHeight = 30;

const SelectMenu = ({ refNode }: Props) => {
    const { selectingContentText: selectingText, setSelectingContentText: setSelectingText } = useTopicWorkspace();
    const [position, setPosition] = useState<Position>();
    const [state, setState] = useState<State>();

    function getSelectionDirection(selection: Selection): SelectionDirection {
        if (selection.rangeCount === 0) return 'forward';
        const range = selection.getRangeAt(0);
        if (range.startContainer !== selection.anchorNode) return 'backward';
        return selection.anchorOffset < selection.focusOffset ? 'forward' : 'backward';
    }

    useEffect(() => {
        function onSelectStart() {
            setState('selecting');
            setSelectingText('');
        }

        function onMouseUp() {
            const node = refNode?.current;
            const selection = document.getSelection();
            const anchorNode = selection?.anchorNode;
            const text = selection?.toString();

            if (!selection || !node) return;
            if (!anchorNode || !node.contains(anchorNode)) return;

            if (!text) {
                setState('idle');
                setSelectingText('');
                return;
            }

            setState('selected');
            setSelectingText(text);

            const selectionRange = selection.getRangeAt(0);
            const clientRect = selectionRange.getBoundingClientRect();
            const direction = getSelectionDirection(selection);
            const top = direction === 'forward' ? clientRect.bottom : clientRect.top;

            setPosition({
                left: clientRect?.left,
                top: top - (selectMenuHeight + 30),
                width: clientRect.width,
                height: clientRect.height,
            });
        }

        document.addEventListener('selectstart', onSelectStart);
        document.addEventListener('mouseup', onMouseUp);
        return () => {
            document.removeEventListener('selectstart', onSelectStart);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }, [refNode]);

    const { GenerateFlashcards, GenerateQuiz, AddToNote } = useSelectMenu();

    const styleForYoutubeSegment: CSSProperties = useMemo(
        () => ({
            transform: `translate3d(${position?.left}px, ${position?.top}px, 0)`,
            minWidth: `${selectMenuWidth}px`,
            minHeight: `${selectMenuHeight}px`,
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 50,
        }),
        [position],
    );

    if (!selectingText || !position || state !== 'selected') {
        return <></>;
    }

    return (
        <div
            className="rounded-lg shadow-lg bg-white/95 backdrop-blur-sm border border-gray-200 flex flex-row gap-2 p-2 "
            style={styleForYoutubeSegment}
        >
            {GenerateFlashcards}
            {GenerateQuiz}
            {AddToNote}
        </div>
    );
};

export default memo(SelectMenu);
