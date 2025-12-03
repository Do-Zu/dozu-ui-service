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
import {
    ILearningMaterial,
    ILearningMaterialWithAttachments,
    IUpdateLearningMaterialBody,
    IUpdateLearningMaterialPayload,
} from '../types/learningMaterial.type';

class LearningMaterialService {
    public async getLearningMaterialsForClass({ classId }: { classId: number }): Promise<ILearningMaterial[]> {
        const response = await getRequest<unknown, any>(`/classes/${classId}/learning-material`);
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data.data.learningMaterials;
    }

    public async getLearningMaterialWithAttachmentsById({
        classId,
        learningMaterialId: learningMaterialId,
    }: {
        classId: number;
        learningMaterialId: number;
    }) {
        const response = await getRequest<unknown, ILearningMaterialWithAttachments>(
            `/classes/${classId}/learning-material/${learningMaterialId}`,
        );
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

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

    public async updateLearningMaterialById({
        classId,
        learningMaterialId,
        learningMaterial,
    }: IUpdateLearningMaterialPayload) {
        const response = await putRequest<IUpdateLearningMaterialBody, ILearningMaterial>(
            `/classes/${classId}/learning-material/${learningMaterialId}`,
            learningMaterial,
        );
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

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
