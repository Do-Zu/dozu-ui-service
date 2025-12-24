import React, { ReactNode, useState } from 'react';
import { Modal } from '../../../../../../../components/modal/Modal';
import { CheckSquare, Eye, FileText, Settings2Icon, Star, Type, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../../../../../../../components/ui/button';
import { Textarea } from '../../../../../../../components/ui/textarea';
import { useGenerateContext } from '../../context/GenerateContext';
import { isEmpty, toNumber } from '@/utils';
import { toast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import { ICustomOptions, IGenerateType, IStartGenerateFn } from '../../types/generate.type';
import toastHelper from '@/utils/toast.helper';

interface IProps {
    className?: string;
    description?: string;
    method: IGenerateType;
    onGenerate: (content?: string, customOptions?: ICustomOptions) => void;
    generateTrigger?: (startGenerate: IStartGenerateFn) => ReactNode;
}

export const CustomizeProperties = ({ className, description, method, onGenerate, generateTrigger }: IProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const { options, updateOption } = useGenerateContext();
    const { listType, difficulty, numberOfItem, focus } = options;
    const t = useTranslations('generate.customize');

    const toggleQuestionType = (type: string) => {
        const newListType = listType.includes(type) ? listType.filter((t) => t !== type) : [...listType, type];
        updateOption('listType', newListType);
    };

    const TypeButton = ({
        label,
        icon: Icon,
        colorClass,
        value,
    }: {
        label: string;
        icon: any;
        colorClass: string;
        value: string;
    }) => {
        const isSelected = listType.includes(value);
        return (
            <button
                onClick={() => toggleQuestionType(value)}
                className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm font-medium',
                    isSelected ? colorClass : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800',
                )}
            >
                <Icon size={16} />
                {label}
            </button>
        );
    };

    const DifficultyButton = ({ label, stars, value }: { label: string; stars: number; value: string }) => {
        const isSelected = difficulty === value;
        return (
            <button
                onClick={() => updateOption('difficulty', value)}
                className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-medium flex-1 justify-center',
                    isSelected
                        ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/50'
                        : 'text-zinc-400 hover:bg-zinc-800 border border-transparent',
                )}
            >
                <div className="flex gap-0.5">
                    {Array.from({ length: stars }).map((_, i) => (
                        <Star key={i} size={14} fill={isSelected ? 'currentColor' : 'none'} />
                    ))}
                    {Array.from({ length: 3 - stars }).map((_, i) => (
                        <Star key={i + stars} size={14} className="opacity-30" />
                    ))}
                </div>
                {label}
            </button>
        );
    };

    const bodyContent = (
        <div className="flex flex-col gap-5">
            <div className="space-y-2">
                <label className="text-sm font-medium ">
                    {t('types.label')} <span className="text-red-500">{t('types.required')}</span>
                </label>
                <div className="border border-zinc-800 rounded-xl p-4 ">
                    <div className="flex flex-wrap gap-3">
                        <TypeButton
                            label={t('types.multipleChoice')}
                            value="Multiple Choice"
                            icon={CheckSquare}
                            colorClass="border-blue-500/50 bg-blue-500/10 text-blue-400"
                        />
                        <TypeButton
                            label={t('types.freeResponse')}
                            value="Free Response"
                            icon={FileText}
                            colorClass="border-green-500/50 bg-green-500/10 text-green-400"
                        />
                        <TypeButton
                            label={t('types.trueOrFalse')}
                            value="True or False"
                            icon={Eye}
                            colorClass="border-purple-500/50 bg-purple-500/10 text-purple-400"
                        />
                        <TypeButton
                            label={t('types.fillInTheBlank')}
                            value="Fill in the blank"
                            icon={Type}
                            colorClass="border-orange-500/50 bg-orange-500/10 text-orange-400"
                        />
                    </div>
                </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
                <label className="text-sm font-medium">
                    {t('difficulty.label')} <span className="text-red-500">{t('difficulty.required')}</span>
                </label>
                <div className="border border-zinc-800 rounded-xl p-1.5  flex gap-1">
                    <DifficultyButton label={t('difficulty.easy')} stars={1} value="Easy" />
                    <DifficultyButton label={t('difficulty.medium')} stars={2} value="Medium" />
                    <DifficultyButton label={t('difficulty.hard')} stars={3} value="Hard" />
                </div>
            </div>

            {/* Number of Questions */}
            <div className="space-y-2">
                <label className="text-sm font-medium dark:text-zinc-200">{t('numberOfItem.label')}</label>
                <input
                    type="number"
                    value={numberOfItem}
                    onChange={(e) => {
                        const number = toNumber(e.target.value);

                        if (isNaN(number) || number < 1) {
                            toast({ description: t('toasts.invalidAmount') });
                            return;
                        }

                        updateOption('numberOfItem', number);
                    }}
                    className="w-full border  rounded-lg px-4 py-3  focus:outline-none focus:ring-1 focus:ring-zinc-700 placeholder:text-zinc-600"
                />
            </div>

            {/* Focus */}
            <div className="space-y-2">
                <label className="text-sm font-medium ">{t('focus.label')}</label>
                <Textarea
                    value={focus}
                    onChange={(e) => updateOption('focus', e.target.value)}
                    placeholder={t('focus.placeholder')}
                    className="w-full  dark:bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 dark:text-zinc-200 focus:outline-none focus:ring-1 dark:focus:ring-zinc-700 min-h-[100px] resize-none dark:placeholder:text-zinc-600"
                />
            </div>
        </div>
    );

    const trigger = (
        <Button variant="outline" className={`rounded-full  ${className}`}>
            <Settings2Icon />
        </Button>
    );

    const cancel = (
        <Button
            variant="outline"
            className="px-4 py-2 rounded-md  hover:bg-opacity-60  transition-colors font-medium text-sm"
        >
            {t('buttons.cancel')}
        </Button>
    );

    const startGenerate: IStartGenerateFn = async (content, customOptions) => {
        if (isEmpty(listType)) {
            toastHelper.showSuccessMessage('Select at least one type to generate content.');
            return;
        }
        onGenerate(content, customOptions);
    };

    const footerTrigger = generateTrigger ? (
        generateTrigger(startGenerate)
    ) : (
        <Button
            onClick={() => startGenerate()}
            disabled={isEmpty(listType)}
            className="px-4 py-2 rounded-md hover:bg-opacity-60 transition-colors font-medium text-sm"
        >
            {t('buttons.generate')}
        </Button>
    );

    const footer = <>{footerTrigger}</>;

    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            trigger={trigger}
            title={t('title')}
            description={description}
            body={bodyContent}
            cancel={cancel}
            footer={footer}
        />
    );
};
