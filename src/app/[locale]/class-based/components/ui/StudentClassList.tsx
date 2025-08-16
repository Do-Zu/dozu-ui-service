import { IClass } from '../../types/class.type';
import { StudentClassCard } from './StudentClassCard'; 

type Props = {
    classes: IClass[];
    handleNameClick: ({ classId, name, description }: { classId: number; name: string; description: string }) => void;
    handleLeaveClick: (classId: number) => void;
};

export function StudentClassList(props: Props) {
    const { classes, handleNameClick } = props;
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {classes.map((myClass: IClass) => {
                const { classId } = myClass;
                return (
                    <StudentClassCard
                        key={classId}
                        classProp={myClass}
                        handleNameClick={handleNameClick}
                        handleLeaveClick={props.handleLeaveClick}
                    />
                );
            })}
        </div>
    );
}
