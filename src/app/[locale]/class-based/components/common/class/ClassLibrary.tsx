import { ShowIf } from '@/components/ui/ShowIf';
import { School } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { IClass } from '../../../types/class.type';
import ClassCard, { ClassCardProps } from './ClassCard';
import React from 'react';
import roleHelper from '@/utils/role.helper';
import { HeaderSection } from '@/components/common/HeaderSection';

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
        <div className="w-full">
            <div className="w-full max-w-[80%] mx-auto mb-12 p-6 rounded-lg shadow-md">
                {/* Main Header */}
                <HeaderSection
                    icon={School}
                    title={tClass('myClasses')}
                    slogan={tClass('slogan')}
                    actionButton={mainActionButtons}
                    description={
                        <ShowIf when={roleHelper.isStudent(role)}>
                            <div className="text-muted-foreground text-sm">{tClass('classesEnrolling')}</div>
                        </ShowIf>
                    }
                />

                {/* Content */}
                <div className="w-full pt-11">

                    {/* Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {classes.map((myClass: IClass) => (
                            <div key={myClass.classId}>{classCard(myClass)}</div>
                        ))}
                    </div>

                    {/* Modals */}
                    {modals}
                </div>
            </div>
        </div>
    );
}
