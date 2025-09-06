import { ShowIf } from '@/components/ui/ShowIf';
import { School } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { IClass } from '../../../types/class.type';
import ClassCard, { ClassCardProps } from './ClassCard';
import React from 'react';
import roleHelper from '@/utils/role.helper';

interface BaseProps {
    classes: IClass[];
    mainActionButtons: React.ReactNode;
    classCard: (myClass: IClass) => React.ReactElement<ClassCardProps, typeof ClassCard>;
    modals: React.ReactNode;
}

interface TeacherProps {
    role: 'teacher';
}

interface StudentProps {
    role: 'student';
}

type Props = BaseProps & (TeacherProps | StudentProps);

export default function ClassLibrary({
    classes,
    role,
    mainActionButtons,
    classCard,
    modals,
}: Props) {
    const tClass = useTranslations('class');
    return (
        <div className="w-full max-w-[85%] mx-auto mb-12 p-6 rounded-lg bg-gray-100 shadow-md dark:bg-gray-800">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2 items-center">
                        <School />
                        <h2 className="text-2xl font-semibold">{tClass('myClasses')}</h2>
                    </div>
                    <ShowIf when={roleHelper.isStudent(role)}>
                        <div>{tClass('classesEnrolling')}</div>
                    </ShowIf>
                </div>
                {mainActionButtons}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {classes.map((myClass: IClass) => (
                    <div key={myClass.classId}>{classCard(myClass)}</div>
                ))}
            </div>

            {/* Modals */}
            {modals}
        </div>
    );
}
