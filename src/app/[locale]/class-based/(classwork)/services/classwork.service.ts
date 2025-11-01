import assignmentService from '../../(assignment)/service/assignment.service';
import { IAssignment } from '../../(assignment)/types/assignment.type';
import learningMaterialService from '../../(learning-material)/service/learningMaterial.service';
import { ILearningMaterial } from '../../(learning-material)/types/learningMaterial.type';
import { ClassworkTypeEnum, IClassworkType } from '../types/classwork.type';

export interface IClasswork {
    type: IClassworkType;
    item: IAssignment | ILearningMaterial;
}

class ClassworkService {
    public async getClassworkForClass({ classId }: { classId: number }) {
        const result: IClasswork[] = [];
        Promise.all([
            assignmentService.getAssignmentsForClass({ classId }),
            learningMaterialService.getLearningMaterialsForClass({ classId }),
        ])
            .then((responses) => {
                const assignments = responses[0];
                const materials = responses[1];
                for (const assignment of assignments) {
                    result.push({
                        type: ClassworkTypeEnum.ASSIGNMENT,
                        item: assignment,
                    });
                }
                for (const material of materials) {
                    result.push({
                        type: ClassworkTypeEnum.LEARNING_MATERIAL,
                        item: material,
                    });
                }
                result.sort((a, b) => {
                    const date1 = new Date(a.item.createdAt),
                        date2 = new Date(b.item.createdAt);
                    if (date1 < date2) return -1;
                    if (date1 > date2) return 1;
                    return 0;
                });
            })
            .catch(() => {
                throw new Error('Failed to get list of classwork, please try again.');
            });
        return result;
    }
}

export default new ClassworkService();
