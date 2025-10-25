import { deleteRequest, getRequest, postRequest, putRequest } from '@/api/api';
import {
    IAssignment,
    ICreateAssignmentPayload,
    IDeleteAssignmentPayload,
    InsertAssignmentBody,
    IUpdateAssignmentBody,
    IUpdateAssignmentPayload,
} from '../../types/assignment.type';
import { ApiResponse } from '@/api/type';

class TeacherAssignmentService {
    public async getAssignmentsForClass({ classId }: { classId: number }): Promise<IAssignment[]> {
        const response = await getRequest<unknown, IAssignment[]>(`/classes/teacher/${classId}/assignments`);
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async getAssignmentById({ classId, assignmentId }: { classId: number; assignmentId: number }) {
        const response = await getRequest<unknown, IAssignment>(
            `/classes/teacher/${classId}/assignments/${assignmentId}`,
        );
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async createAssignment({ classId, assignment }: ICreateAssignmentPayload): Promise<IAssignment> {
        const response = await postRequest<InsertAssignmentBody, IAssignment>(
            `/classes/teacher/${classId}/assignments`,
            assignment,
        );
        if (response.status !== 'created') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async updateAssignmentById({ classId, assignmentId, assignment }: IUpdateAssignmentPayload) {
        const response = await putRequest<IUpdateAssignmentBody, IAssignment>(
            `/classes/teacher/${classId}/assignments/${assignmentId}`,
            assignment,
        );
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async deleteAssignmentById({ classId, assignmentId }: IDeleteAssignmentPayload) {
        const response = await deleteRequest<unknown, ApiResponse<number>>(
            `/classes/teacher/${classId}/assignments/${assignmentId}`,
        );
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }
}

export default new TeacherAssignmentService();
