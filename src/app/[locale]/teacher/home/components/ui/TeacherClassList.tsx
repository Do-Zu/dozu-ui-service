import { IClass } from '@/app/[locale]/class-based/types/class.type';
import { TeacherClassCard } from './TeacherClassCard';
import { IUpdatingClass } from '../modal/class/UpdateClassModal';

type Props = {
    classes: IClass[];
    handleNameClick: ({ classId, name, description }: { classId: number; name: string; description: string }) => void;
    handleOpenUpdateModal: (data: IUpdatingClass) => void;
};

export function TeacherClassList(props: Props) {
    const { classes, handleNameClick } = props;
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {classes.map((myClass: IClass) => {
                const { classId } = myClass;
                return (
                    <TeacherClassCard
                        key={classId}
                        classProp={myClass}
                        handleNameClick={handleNameClick}
                        handleUpdateClassSelect={props.handleOpenUpdateModal}
                    />
                );
            })}
        </div>
    );
}
