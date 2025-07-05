import { ClassCard } from './ClassCard';
import { IClass } from '../types/class.type';

interface Props {
    classes: IClass[];

    handleOpenUpdateModal: ({
        classId,
        name,
        description,
    }: {
        classId: number;
        name: string;
        description: string;
    }) => void;

    handleNameClick: ({ classId, name, description }: { classId: number; name: string; description: string }) => void;
}

export function ClassesList({ classes, handleOpenUpdateModal, handleNameClick }: Props) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {classes.map((myClass: IClass) => {
                const { classId, name, description } = myClass;
                return (
                    <ClassCard
                        key={myClass.classId}
                        classProp={myClass}
                        handleUpdateClassSelect={() => handleOpenUpdateModal({ classId, name, description })}
                        handleNameClick={handleNameClick}
                    />
                );
            })}
        </div>
    );
}
