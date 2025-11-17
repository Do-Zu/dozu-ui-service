import assignmentService from '../../(assignment)/service/assignment.service';
import { IAssignment } from '../../(assignment)/types/assignment.type';
import learningMaterialService from '../../(learning-material)/service/learningMaterial.service';
import classQuizTeacherService from '../../(class-quiz)/services/classQuizTeacher.service';
import { ILearningMaterial } from '../../(learning-material)/types/learningMaterial.type';
import { IClassQuizListItem } from '../../(class-quiz)/types/classQuiz.type';
import { ClassworkTypeEnum, IClassworkType } from '../types/classwork.type';

export interface IClasswork {
    type: IClassworkType;
    item: IAssignment | ILearningMaterial | IClassQuizListItem ;
}

class ClassworkService {
    public async getClassworkForClass({ classId }: { classId: number }) {
        try {
            let result: IClasswork[];
            const [assignments, materials, quizzes] = await Promise.all([
                assignmentService.getAssignmentsForClass({ classId }),
                learningMaterialService.getLearningMaterialsForClass({ classId }),
                classQuizTeacherService.listClassQuizzes(classId),
            ]);

            result = [
                ...assignments.map((assignment) => ({
                    type: ClassworkTypeEnum.ASSIGNMENT,
                    item: assignment,
                })),
                ...materials.map((material) => ({
                    type: ClassworkTypeEnum.LEARNING_MATERIAL,
                    item: material,
                })),
                ...quizzes.map((q) => ({ 
                    type: ClassworkTypeEnum.QUIZ, 
                    item: q 
                })),
            ];

            result.sort((a, b) => {
                const date1 = new Date((a.item as any).createdAt ?? 0),
                    date2 = new Date((b.item as any).createdAt ?? 0);
                if (date1 < date2) return 1;
                if (date1 > date2) return -1;
                return 0;
            });
            return result;
        } catch (err) {
            throw new Error('Failed to get list of classwork, please try again.');
        }
    }
}

export default new ClassworkService();
