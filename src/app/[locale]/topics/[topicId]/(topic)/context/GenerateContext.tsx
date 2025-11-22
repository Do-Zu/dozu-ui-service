import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface IGenerateOptions {
    numberOfItem: number;
    difficulty: string;
    focus: string;
    listType: string[];
}

interface IGenerateContext {
    options: IGenerateOptions;
    setOptions: (options: IGenerateOptions) => void;
    updateOption: <K extends keyof IGenerateOptions>(key: K, value: IGenerateOptions[K]) => void;
}

const GenerateContext = createContext<IGenerateContext | undefined>(undefined);

export const GenerateProvider = ({ children }: { children: ReactNode }) => {
    const listDefaultType = ['Multiple Choice', 'Free Response', 'True or False', 'Fill in the blank'];
    const DEFAULT_DIFFICULT = 'Medium';
    const DEFAULT_NUMBER_OF_ITEM = 20;

    const [options, setOptions] = useState<IGenerateOptions>({
        numberOfItem: DEFAULT_NUMBER_OF_ITEM,
        difficulty: DEFAULT_DIFFICULT,
        focus: '',
        listType: listDefaultType,
    });

    const updateOption = <K extends keyof IGenerateOptions>(key: K, value: IGenerateOptions[K]) => {
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
