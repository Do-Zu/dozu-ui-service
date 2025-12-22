import React, { useState } from 'react';
import Generate from '../../generate/Generate';
import CustomizedGenerateOptions from './CustomizedGenerateOptions';
import DefaultGenerateButton from '../../generate/DefaultGenerateButton';
import { IStartGenerateFn } from '../../../types/generate.type';
import { IColorTheme, IMindmapGenerateOptions, IMindmapType } from '@/types/mindmap/mindmap.type';
import { DEFAULT_THEME } from '../../../constants/mindmap/colorTheme.constant';
import { useTopicWorkspace } from '../../../context/TopicWorkspaceContext';
import toastHelper from '@/utils/toast.helper';
interface Props {
    onHandleBeforeGenerate?: () => void;
    onSuccess?: (data: any) => void;
}

export default function MindmapGenerate({ onHandleBeforeGenerate, onSuccess }: Props) {
    const [open, setOpen] = useState<boolean>(false);
    const [type, setType] = useState<IMindmapType>('abstract');
    const [colorTheme, setColorTheme] = useState<IColorTheme>(DEFAULT_THEME);
    const [range, setRange] = useState<{ start: number; end: number } | null>(null);
    const [instruction, setInstruction] = useState<string>('');
    const { getLearningMaterialContent } = useTopicWorkspace();

    async function onGenerateClick(startGenerate: IStartGenerateFn) {
        const mindmapGenerateOptions: IMindmapGenerateOptions = { type, colorTheme, instruction };
        if (!range) {
            toastHelper.showErrorMessage('Range not found.');
            return;
        }
        if (range.start > range.end) {
            toastHelper.showSuccessMessage('Start section should be less than or equal to end section.');
            return;
        }
        try {
            const content = getLearningMaterialContent(range);
            await startGenerate(content, { mindmapGenerateOptions });
        } catch (err) {
            toastHelper.showErrorMessage(err);
        }
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
                        range={range}
                        setRange={setRange}
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
