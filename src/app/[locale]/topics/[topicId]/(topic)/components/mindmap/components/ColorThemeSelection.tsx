import { Modal } from '@/components/modal/Modal';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { IColorMode, IColorTheme } from '@/types/mindmap/mindmap.type';
import { ChevronRightIcon } from 'lucide-react';
import React, { Dispatch, ReactElement, SetStateAction, useMemo } from 'react';

interface ThemeItemProps {
    theme: IColorTheme;
    isSelected: boolean;
    onSelect?: (theme: IColorTheme) => void;
}

export function ThemeItem({ theme, isSelected, onSelect }: ThemeItemProps) {
    return (
        <Button
            variant="outline"
            className={cn(
                'h-auto flex flex-col items-start justify-start p-3 text-left transition-all duration-200 border-2 w-full',
                isSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-input dark:border-slate-800 hover:border-primary/50',
            )}
            onClick={() => onSelect?.(theme)}
        >
            <div className={cn('text-xs font-bold mb-2', isSelected ? 'text-primary' : 'text-foreground')}>
                {theme.name}
            </div>
            <div className="flex gap-1">
                {theme.colors.map((color, idx) => (
                    <span
                        key={idx}
                        className="h-3 w-3 rounded-full border border-black/10"
                        style={{ backgroundColor: color }}
                    />
                ))}
            </div>
        </Button>
    );
}

interface Props {
    trigger?: ReactElement;
    colorMode?: IColorMode;
    onColorModeChange?: (mode: IColorMode) => void;
    themes: IColorTheme[];
    selectedTheme?: IColorTheme;
    onThemeSelect: (theme: IColorTheme) => void;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function ColorThemeSelection({
    trigger,
    colorMode,
    onColorModeChange,
    themes,
    selectedTheme,
    onThemeSelect,
    open,
    setOpen,
}: Props) {
    const { lightThemes, darkThemes } = useMemo(() => {
        return {
            lightThemes: themes.filter((t) => t.type === 'light'),
            darkThemes: themes.filter((t) => t.type === 'dark'),
        };
    }, [themes]);

    return (
        <Modal
            trigger={
                trigger ?? (
                    <Button
                        variant="ghost"
                        className="h-[68px] border-2 border-dashed flex flex-col items-center justify-center gap-1 px-4 hover:bg-accent"
                    >
                        <ChevronRightIcon size={18} />
                        <span className="text-[10px] font-medium">Show more</span>
                    </Button>
                )
            }
            isOpen={open}
            setIsOpen={setOpen}
            title="Select Color Theme"
            body={
                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                    {colorMode ? (
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                Coloring Mode
                            </h4>

                            <div className="flex gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="sm"
                                            variant={colorMode === 'branch' ? 'default' : 'outline'}
                                            onClick={() => onColorModeChange?.('branch')}
                                        >
                                            By Branch
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                        <p className="text-xs max-w-[200px]">One color per branch.</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="sm"
                                            variant={colorMode === 'depth' ? 'default' : 'outline'}
                                            onClick={() => onColorModeChange?.('depth')}
                                        >
                                            By Depth
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                        <p className="text-xs max-w-[200px]">Same depth, same color.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    ) : null}

                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b pb-1">
                            Light Themes
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            {lightThemes.map((theme) => (
                                <ThemeItem
                                    key={theme.name}
                                    theme={theme}
                                    isSelected={selectedTheme?.name === theme.name}
                                    onSelect={onThemeSelect}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b pb-1">
                            Dark Themes
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            {darkThemes.map((theme) => (
                                <ThemeItem
                                    key={theme.name}
                                    theme={theme}
                                    isSelected={theme.name === selectedTheme?.name}
                                    onSelect={onThemeSelect}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            }
        />
    );
}
