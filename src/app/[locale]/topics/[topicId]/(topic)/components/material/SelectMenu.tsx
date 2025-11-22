'use client';

import { useEffect, useState } from 'react';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import useSelectMenu from '../../hooks/useSelectMenu';

interface Props {
    type: 'pdf' | 'youtube';
    refNode: HTMLDivElement | null;
}

interface Position {
    left: number;
    top: number;
    width: number;
    height: number;
}

type State = 'idle' | 'selecting' | 'selected';
const selectMenuWidth = 200;
const selectMenuHeight = 30;

export default function SelectMenu({ refNode, type }: Props) {
    const { selectingContentText: selectingText, setSelectingContentText: setSelectingText } = useTopicWorkspace();
    const [position, setPosition] = useState<Position>();
    const [state, setState] = useState<State>();

    useEffect(() => {
        function onSelectStart() {
            setState('selecting');
            setSelectingText('');
        }

        function onMouseUp() {
            const selection = document.getSelection();
            const anchorNode = selection?.anchorNode;
            const text = selection?.toString();

            if (!selection || !refNode) return;
            if (!anchorNode || !refNode.contains(anchorNode)) return;
            if (!text) {
                setState('idle');
                setSelectingText('');
                return;
            }

            setState('selected');
            setSelectingText(text);

            const selectionRange = selection.getRangeAt(0);
            const clientRect = selectionRange.getBoundingClientRect();

            setPosition({
                left: 30,
                top: clientRect.top + window.scrollY - (selectMenuHeight + 30),
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

    if (!selectingText || !position || state !== 'selected') {
        return <></>;
    }

    return (
        <div
            className="rounded-lg shadow-lg bg-white/95 backdrop-blur-sm border border-gray-200 flex flex-row gap-2 p-2"
            style={
                type === 'pdf'
                    ? {}
                    : {
                          transform: `translate3d(${position.left}px, ${position.top}px, 0)`,
                          minWidth: `${selectMenuWidth}px`,
                          minHeight: `${selectMenuHeight}px`,
                          position: 'absolute',
                          top: 0,
                          left: 0,
                      }
            }
        >
            {GenerateFlashcards}
            {GenerateQuiz}
            {AddToNote}
        </div>
    );
}
