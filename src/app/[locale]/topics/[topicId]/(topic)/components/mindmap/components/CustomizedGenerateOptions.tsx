'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/modal/Modal';
import { COLOR_THEMES } from '../../../constants/mindmap/mindmap.constant';
import { Dispatch, SetStateAction } from 'react';
import { Settings2Icon } from 'lucide-react';
import { IColorTheme, IMindmapType } from '@/types/mindmap/mindmap.type';

interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    type: IMindmapType;
    setType: Dispatch<SetStateAction<IMindmapType>>;
    colorTheme: IColorTheme | null;
    setColorTheme: Dispatch<SetStateAction<IColorTheme | null>>;
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
    function handleTypeSelect(input: IMindmapType) {
        setType(input);
    }

    function handleColorThemesSelect(input: IColorTheme) {
        if (input.name === colorTheme?.name) setColorTheme(null);
        else setColorTheme(input);
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
                    {/* Depths */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Type *</Label>
                        <div className="flex gap-2">
                            {[
                                { key: 'abstract', label: 'Abstract', description: 'High-level overview' },
                                { key: 'detailed', label: 'Detailed', description: 'In-depth exploration' },
                            ].map((mindmapType) => (
                                <Button
                                    key={mindmapType.key}
                                    variant={type === mindmapType.key ? 'default' : 'outline'}
                                    className={cn(
                                        'flex-1 h-auto py-3 px-4 flex flex-col items-start gap-1 transition-all duration-200',
                                        type !== mindmapType.key &&
                                            'hover:border-primary/50 border-input dark:border-slate-700',
                                    )}
                                    onClick={() => handleTypeSelect(mindmapType.key as IMindmapType)}
                                >
                                    <span className="text-sm font-medium">{mindmapType.label}</span>
                                    <span className="text-xs text-muted-foreground">{mindmapType.description}</span>
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Color Themes */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Color Theme *</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {COLOR_THEMES.map((theme) => {
                                const isSelected = colorTheme?.name === theme.name;
                                return (
                                    <Button
                                        key={theme.name}
                                        variant="outline"
                                        className={cn(
                                            'h-auto flex flex-col items-start justify-start p-3 text-left transition-all duration-200 border-2',
                                            isSelected
                                                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                : 'border-input dark:border-slate-800 hover:border-primary/50',
                                        )}
                                        onClick={() => handleColorThemesSelect(theme)}
                                    >
                                        <div
                                            className={cn(
                                                'text-sm font-bold mb-2',
                                                isSelected ? 'text-primary' : 'text-foreground',
                                            )}
                                        >
                                            {theme.name}
                                        </div>
                                        <div className="flex gap-1.5">
                                            {theme.colors.map((color, idx) => (
                                                <span
                                                    key={`${theme.name}-${idx}`}
                                                    className="h-4 w-4 rounded-full border border-black/10 dark:border-white/10"
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </Button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Custom Prompt */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Custom Instructions</Label>
                        <Textarea
                            placeholder="E.g. Focus more on definitions, keep descriptions short, emphasize relationships..."
                            className="min-h-[100px]"
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
