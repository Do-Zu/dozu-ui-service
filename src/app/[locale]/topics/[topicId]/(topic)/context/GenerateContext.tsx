import { ICommonGenerateOptions } from '@/hooks/generate/type';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface IGenerateContext {
    options: ICommonGenerateOptions;
    setOptions: (options: ICommonGenerateOptions) => void;
    updateOption: <K extends keyof ICommonGenerateOptions>(key: K, value: ICommonGenerateOptions[K]) => void;
}

const GenerateContext = createContext<IGenerateContext | undefined>(undefined);

export const GenerateProvider = ({ children }: { children: ReactNode }) => {
    const DEFAULT_LIST_TYPE = ['Multiple Choice', 'Free Response', 'True or False', 'Fill in the blank'];
    const DEFAULT_DIFFICULT = 'Medium';
    const DEFAULT_NUMBER_OF_ITEM = 20;

    const [options, setOptions] = useState<ICommonGenerateOptions>({
        numberOfItem: DEFAULT_NUMBER_OF_ITEM,
        difficulty: DEFAULT_DIFFICULT,
        focus: '',
        listType: DEFAULT_LIST_TYPE,
    });

    const updateOption = <K extends keyof ICommonGenerateOptions>(key: K, value: ICommonGenerateOptions[K]) => {
        setOptions((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <GenerateContext.Provider value={{ options, setOptions, updateOption }}>{children}</GenerateContext.Provider>
    );
};

export const useGenerateContext = () => {
    const context = useContext(GenerateContext);
    if (!context) {
        throw new Error('useGenerateContext must be used within a GenerateProvider');
    }
    return context;
};
