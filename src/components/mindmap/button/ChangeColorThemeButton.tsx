import { useMindMapContext } from '@/app/[locale]/mindmap/context/MindMapContext';
import ColorThemeSelection from '@/app/[locale]/topics/[topicId]/(topic)/components/mindmap/components/ColorThemeSelection';
import { COLOR_THEMES } from '@/app/[locale]/topics/[topicId]/(topic)/constants/mindmap/colorTheme.constant';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AppEdge, IColorMode, IColorTheme } from '@/types/mindmap/mindmap.type';
import colorThemeUtils from '@/utils/mindmap/colorThemeUtils';
import { Palette } from 'lucide-react';
import { useState } from 'react';

export default function ChangeColorThemeButton() {
    const { nodes, edges, setNodes, setEdges } = useMindMapContext();
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
                const nodeColor = item.data.isRoot ? '' : colorMap.get(item.data.nodeId);
                return { ...item, data: { ...item.data, color: nodeColor } };
            });
        });

        setEdges((prev) => {
            return prev.map((edge) => {
                const edgeColor = colorMap.get(edge.target) ?? '';
                return { ...edge, data: { ...edge.data, color: edgeColor } };
            }) as AppEdge[];
        });
        setOpen(false);
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <ColorThemeSelection
                    trigger={
                        <Button variant="outline" size="icon-sm">
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
