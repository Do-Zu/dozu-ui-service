import { deleteRequest, getRequest, postRequest, putRequest } from '@/api/api';
// import {
//     IAssignment,
//     IAssignmentWithAttachments,
//     ICreateAssignmentPayload,
//     IDeleteAssignmentPayload,
//     InsertAssignmentBody,
//     IUpdateAssignmentBody,
//     IUpdateAssignmentPayload,
// } from '../types/assignment.type';
import { ApiResponse } from '@/api/type';
import { ILearningMaterial } from '../types/learningMaterial.type';

class LearningMaterialService {
    public async getLearningMaterialsForClass({ classId }: { classId: number }): Promise<ILearningMaterial[]> {
        console.log('firing');
        const response = await getRequest<unknown, any>(`/classes/${classId}/learning-material`);
        console.log('learning material response', response);
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data.data.learningMaterials;
    }

    // public async getAssignmentWithAttachmentsById({
    //     classId,
    //     assignmentId,
    // }: {
    //     classId: number;
    //     assignmentId: number;
    // }) {
    //     const response = await getRequest<unknown, IAssignmentWithAttachments>(
    //         `/classes/${classId}/assignments/${assignmentId}`,
    //     );
    //     if (response.status !== 'success') {
    //         throw new Error(response.message);
    //     }
    //     return response.data;
    // }

    // public async createAssignment({ classId, assignment }: ICreateAssignmentPayload): Promise<IAssignment> {
    //     const response = await postRequest<InsertAssignmentBody, IAssignment>(
    //         `/classes/${classId}/assignments`,
    //         assignment,
    //     );
    //     if (response.status !== 'created') {
    //         throw new Error(response.message);
    //     }
    //     return response.data;
    // }

    // public async updateAssignmentById({ classId, assignmentId, assignment }: IUpdateAssignmentPayload) {
    //     const response = await putRequest<IUpdateAssignmentBody, IAssignment>(
    //         `/classes/${classId}/assignments/${assignmentId}`,
    //         assignment,
    //     );
    //     if (response.status !== 'success') {
    //         throw new Error(response.message);
    //     }
    //     return response.data;
    // }

    public async deleteLearningMaterialById({
        classId,
        learningMaterialId,
    }: {
        classId: number;
        learningMaterialId: number;
    }) {
        const response = await deleteRequest<unknown, any>(
            `/classes/${classId}/learning-material/${learningMaterialId}`,
        );
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }
}

export default new LearningMaterialService();
