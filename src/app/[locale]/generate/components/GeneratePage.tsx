'use client';

import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import CardImport from './CardImport';

export type ClassPropsInGenerate =
    | { mode: MODE_ACCESS_PAGE_ROLE.personal }
    | { mode: MODE_ACCESS_PAGE_ROLE.classBased; classId: number };

export default function GeneratePage(props: ClassPropsInGenerate) {
    return <CardImport classProps={props} />;
}
