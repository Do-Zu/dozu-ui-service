import { useMindMapContext } from '@/app/[locale]/mindmap/context/MindMapContext';
import ColorThemeSelection, {
    IColorMode,
} from '@/app/[locale]/topics/[topicId]/(topic)/components/mindmap/components/ColorThemeSelection';
import { COLOR_THEMES } from '@/app/[locale]/topics/[topicId]/(topic)/constants/mindmap/colorTheme.constant';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { IColorTheme } from '@/types/mindmap/mindmap.type';
import colorThemeUtils from '@/utils/mindmap/colorThemeUtils';
import { Palette } from 'lucide-react';
import { useState } from 'react';

export default function ChangeColorThemeButton() {
    const { nodes, edges, setNodes } = useMindMapContext();
    const [open, setOpen] = useState<boolean>(false);
    const [colorMode, setColorMode] = useState<IColorMode>('branch');

    function handleThemeSelect(colorTheme: IColorTheme) {
        const colorMap = colorThemeUtils.changeColorTheme({ nodes, edges, colorTheme, colorMode });
        if (!colorMap) {
            setOpen(false);
            return;
        }
        setNodes((prev) => {
            return prev.map((item) => {
                if (item.data.isRoot) return item;
                return { ...item, data: { ...item.data, color: colorMap.get(item.data.nodeId) } };
            });
        });
        setOpen(false);
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <ColorThemeSelection
                    trigger={
                        <Button variant="ghost" size="icon-sm">
                            <Palette />
                        </Button>
                    }
                    open={open}
                    setOpen={setOpen}
                    themes={COLOR_THEMES}
                    onThemeSelect={handleThemeSelect}
                    colorMode={colorMode}
                    onColorModeChange={(mode) => setColorMode(mode)}
                />
            </TooltipTrigger>
            <TooltipContent side="bottom">Change color theme</TooltipContent>
        </Tooltip>
    );
}
