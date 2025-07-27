import { IClass } from '../types/class.type';
import { StudentClassCard } from './student/StudentClassCard';
import { TeacherClassCard } from './teacher/TeacherClassCard';

type Props =
    | {
          role: 'teacher';
          classes: IClass[];
          handleNameClick: ({
              classId,
              name,
              description,
          }: {
              classId: number;
              name: string;
              description: string;
          }) => void;
          handleOpenUpdateModal: ({
              classId,
              name,
              description,
          }: {
              classId: number;
              name: string;
              description: string;
          }) => void;
      }
    | {
          role: 'student';
          classes: IClass[];
          handleNameClick: ({
              classId,
              name,
              description,
          }: {
              classId: number;
              name: string;
              description: string;
          }) => void;
          handleLeaveClick: (classId: number) => void; 
      };

export function ClassesList(props: Props) {
    const { role, classes, handleNameClick } = props;
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {classes.map((myClass: IClass) => {
                const { classId } = myClass;
                return role === 'student' ? (
                    <StudentClassCard
                        key={classId}
                        classProp={myClass}
                        handleNameClick={handleNameClick}
                        handleLeaveClick={props.handleLeaveClick}
                    />
                ) : (
                    <TeacherClassCard
                        key={classId}
                        classProp={myClass}
                        handleNameClick={handleNameClick}
                        handleUpdateClassSelect={props.handleOpenUpdateModal}
                    />
                )
            })}
        </div>
    );
}
