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
    const idParam = (params?.id ?? '') as string | string[];
    const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
    const classId = Number.parseInt(idStr, 10);

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
