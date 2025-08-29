'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

interface ClassBasedContextType {
    classId: number;
}

export type { ClassBasedContextType };

const ClassBasedContext = createContext<ClassBasedContextType | undefined>(undefined);

export function ClassBasedProvider({ children }: { children: ReactNode }) {
    const params = useParams();

    const classId = Number(params.id as string);

    const contextValue = useMemo(
        () => ({
            classId,
        }),
        [classId],
    );

    return <ClassBasedContext.Provider value={contextValue}>{children}</ClassBasedContext.Provider>;
}

export const useClassBased = () => {
    const context = useContext(ClassBasedContext);
    if (!context) {
        throw new Error('useClassBased must be used within a ClassBasedProvider');
    }
    return context;
};
