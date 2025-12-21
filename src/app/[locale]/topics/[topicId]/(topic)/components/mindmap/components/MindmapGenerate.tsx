import React, { useState } from 'react';
import Generate from '../../generate/Generate';
import CustomizedGenerateOptions from './CustomizedGenerateOptions';
import DefaultGenerateButton from '../../generate/DefaultGenerateButton';
import { IStartGenerateFn } from '../../../types/generate.type';
import { IColorTheme, IMindmapGenerateOptions, IMindmapType } from '@/types/mindmap/mindmap.type';
import { DEFAULT_THEME } from '../../../constants/mindmap/colorTheme.constant';
interface Props {
    onHandleBeforeGenerate?: () => void;
    onSuccess?: (data: any) => void;
}

export default function MindmapGenerate({ onHandleBeforeGenerate, onSuccess }: Props) {
    const [open, setOpen] = useState<boolean>(false);
    const [type, setType] = useState<IMindmapType>('abstract');
    const [colorTheme, setColorTheme] = useState<IColorTheme>(DEFAULT_THEME);
    const [instruction, setInstruction] = useState<string>('');

    async function onGenerateClick(startGenerate: IStartGenerateFn) {
        const options: IMindmapGenerateOptions = { type, colorTheme, instruction };
        await startGenerate(undefined, { mindmapGenerateOptions: options });
    }

    return (
        <Generate
            type="mindmap"
            onHandleBeforeGenerate={onHandleBeforeGenerate}
            onSuccess={onSuccess}
            trigger={(startGenerate) => (
                <div className="flex flex-row gap-2 items-center py-4">
                    <CustomizedGenerateOptions
                        open={open}
                        setOpen={setOpen}
                        type={type}
                        setType={setType}
                        colorTheme={colorTheme}
                        setColorTheme={setColorTheme}
                        instruction={instruction}
                        setInstruction={setInstruction}
                        onGenerateClick={() => onGenerateClick(startGenerate)}
                    />
                    <DefaultGenerateButton onClick={() => onGenerateClick(startGenerate)} />
                </div>
            )}
        />
    );
}
