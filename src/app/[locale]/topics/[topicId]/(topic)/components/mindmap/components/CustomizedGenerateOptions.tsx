'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/modal/Modal';
import { COLOR_THEMES } from '../../../constants/mindmap/colorTheme.constant';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Settings2Icon } from 'lucide-react';
import { IColorTheme, IMindmapType } from '@/types/mindmap/mindmap.type';
import ColorThemeSelection, { ThemeItem } from './ColorThemeSelection';
import ReferenceEdit from '../../flashcard/node/reference/ReferenceEdit';
import { useTopicWorkspace } from '../../../context/TopicWorkspaceContext';
import { EnumLearningMaterial, ITranscriptSegment } from '../../../types';

interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    type: IMindmapType;
    setType: Dispatch<SetStateAction<IMindmapType>>;
    colorTheme: IColorTheme;
    setColorTheme: Dispatch<SetStateAction<IColorTheme>>;
    range: { start: number; end: number } | null;
    setRange: Dispatch<SetStateAction<{ start: number; end: number } | null>>;
    instruction: string;
    setInstruction: Dispatch<SetStateAction<string>>;
    onGenerateClick: () => void;
}

export default function CustomizedGenerateOptions({
    open,
    setOpen,
    onGenerateClick,
    type,
    setType,
    colorTheme,
    setColorTheme,
    range,
    setRange,
    instruction,
    setInstruction,
}: Props) {
    const { learningMaterial, totalPages } = useTopicWorkspace();
    const [showAllThemes, setShowAllThemes] = useState(false);
    useEffect(() => {
        if (learningMaterial?.type === EnumLearningMaterial.file) {
            if (totalPages) setRange({ start: 1, end: totalPages });
        } else if (
            learningMaterial?.type === EnumLearningMaterial.youtube ||
            learningMaterial?.type === EnumLearningMaterial.media
        ) {
            const len = (learningMaterial.content as ITranscriptSegment[]).length;
            if (len > 0) {
                const start = (learningMaterial.content as ITranscriptSegment[])[0].startTime;
                const end = (learningMaterial.content as ITranscriptSegment[])[len - 1].startTime;
                setRange({ start, end });
            }
        }
    }, [learningMaterial, totalPages]);

    function handleThemeSelect(theme: IColorTheme) {
        setColorTheme(theme);
        setShowAllThemes(false);
    }

    function handlePageStartIndexChange(value: string) {
        if (!totalPages) return;
        const page = parseInt(value);
        if (value === '' || isNaN(page) || page < 1 || page > totalPages) {
            setRange((prev) => (prev ? { ...prev, start: 1 } : prev));
            return;
        }
        setRange((prev) => (prev ? { ...prev, start: page } : prev));
    }

    function handlePageEndIndexChange(value: string) {
        if (!totalPages) return;
        const page = parseInt(value);
        if (value === '' || isNaN(page) || page < 1 || page > totalPages) {
            setRange((prev) => (prev ? { ...prev, end: totalPages } : prev));
            return;
        }
        setRange((prev) => (prev ? { ...prev, end: page } : prev));
    }

    function handleStartSegmentChange(value: string) {
        if (
            (learningMaterial?.type !== EnumLearningMaterial.youtube &&
                learningMaterial?.type !== EnumLearningMaterial.media) ||
            learningMaterial?.content.length === 0
        )
            return;
        const seconds = parseInt(value);
        if (value === '' || isNaN(seconds)) {
            setRange((prev) => {
                const start = (learningMaterial.content as ITranscriptSegment[])[0].startTime;
                return prev ? { ...prev, start } : prev;
            });
            return;
        }

        setRange((prev) => {
            return prev ? { ...prev, start: seconds } : prev;
        });
    }

    function handleEndSegmentChange(value: string) {
        let len;
        if (
            (learningMaterial?.type !== EnumLearningMaterial.youtube &&
                learningMaterial?.type !== EnumLearningMaterial.media) ||
            (len = learningMaterial?.content.length) === 0
        )
            return;
        const seconds = parseInt(value);
        if (value === '' || isNaN(seconds)) {
            setRange((prev) => {
                const end = (learningMaterial.content as ITranscriptSegment[])[len - 1].startTime;
                return prev ? { ...prev, end } : prev;
            });
            return;
        }

        setRange((prev) => {
            return prev ? { ...prev, end: seconds } : prev;
        });
    }

    return (
        <Modal
            isOpen={open}
            setIsOpen={setOpen}
            trigger={
                <Button variant="outline" className="rounded-full">
                    <Settings2Icon />
                </Button>
            }
            title="Customize"
            body={
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Type *</Label>
                        <div className="flex gap-2">
                            {['abstract', 'detailed'].map((key) => (
                                <Button
                                    key={key}
                                    variant={type === key ? 'default' : 'outline'}
                                    className="flex-1 capitalize h-10"
                                    onClick={() => setType(key as IMindmapType)}
                                >
                                    {key}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Color Theme</Label>
                        <div className="flex items-center gap-3">
                            {colorTheme && (
                                <div className="flex-1">
                                    <ThemeItem theme={colorTheme} isSelected={false} />
                                </div>
                            )}

                            <ColorThemeSelection
                                themes={COLOR_THEMES}
                                selectedTheme={colorTheme}
                                onThemeSelect={handleThemeSelect}
                                open={showAllThemes}
                                setOpen={setShowAllThemes}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        {learningMaterial?.type === EnumLearningMaterial.file ? (
                            <ReferenceEdit
                                type="pdf"
                                isEditing={true}
                                pageStartIndex={range?.start}
                                onPageStartIndexChange={handlePageStartIndexChange}
                                pageEndIndex={range?.end}
                                onPageEndIndexChange={handlePageEndIndexChange}
                            />
                        ) : null}

                        {learningMaterial?.type === EnumLearningMaterial.youtube ||
                        learningMaterial?.type === EnumLearningMaterial.media ? (
                            <ReferenceEdit
                                type={learningMaterial.type}
                                isEditing={true}
                                segments={learningMaterial.content}
                                startSegment={range?.start}
                                onStartSegmentChange={handleStartSegmentChange}
                                endSegment={range?.end}
                                onEndSegmentChange={handleEndSegmentChange}
                            />
                        ) : null}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Custom Instructions</Label>
                        <Textarea
                            placeholder="E.g. Focus more on definitions..."
                            value={instruction}
                            onChange={(e) => setInstruction(e.target.value)}
                        />
                    </div>
                </div>
            }
            cancel={<Button variant="ghost">Cancel</Button>}
            footer={<Button onClick={onGenerateClick}>Generate</Button>}
        />
    );
}
