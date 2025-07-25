'use client';

import CardImport from './CardImport';

export type ClassPropsInGenerate = { mode: 'personal' } | { mode: 'class-based'; classId: number };

export default function GeneratePage(props: ClassPropsInGenerate) {
    return <CardImport classProps={props} />
}
