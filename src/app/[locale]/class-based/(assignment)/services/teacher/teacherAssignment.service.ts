import { getRequest } from '@/api/api';
import { IAssignment } from '../../types/assignment.type';

class TeacherAssignmentService {
    public async getAssignmentsForClass({ classId }: { classId: number }): Promise<IAssignment[]> {
        const response = await getRequest<unknown, IAssignment[]>(`/classes/teacher/${classId}/assignments`);
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }
}

export default new TeacherAssignmentService();
