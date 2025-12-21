'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/modal/Modal';
import { COLOR_THEMES } from '../../../constants/mindmap/colorTheme.constant';
import { Dispatch, SetStateAction, useState } from 'react';
import { Settings2Icon } from 'lucide-react';
import { IColorTheme, IMindmapType } from '@/types/mindmap/mindmap.type';
import ColorThemeSelection, { ThemeItem } from './ColorThemeSelection';

interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    type: IMindmapType;
    setType: Dispatch<SetStateAction<IMindmapType>>;
    colorTheme: IColorTheme;
    setColorTheme: Dispatch<SetStateAction<IColorTheme>>;
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
    instruction,
    setInstruction,
}: Props) {
    const [showAllThemes, setShowAllThemes] = useState(false);

    function handleThemeSelect(theme: IColorTheme) {
        setColorTheme(theme);
        setShowAllThemes(false);
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
