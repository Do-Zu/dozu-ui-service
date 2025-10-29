import { getRequest, putRequest } from '@/api/api';
import {
    IAssignmentSubmission,
    IAssignmentSubmissionWithStudent,
    IGradeAssignmentSubmissionPayload,
    IUpdateAssignmentSubmissionBody,
} from '../types/assignmentSubmission.type';

export interface IUpdateAssignmentSubmissionPayload {
    assignmentId: number;
    submissionId: number;
    data: IUpdateAssignmentSubmissionBody;
}

class AssignmentSubmissionService {
    public async getAssignmentSubmission({ assignmentId }: { assignmentId: number }) {
        const response = await getRequest<unknown, IAssignmentSubmission>(`/assignments/${assignmentId}/submissions`);
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async updateAssignmentSubmission({ assignmentId, submissionId, data }: IUpdateAssignmentSubmissionPayload) {
        const response = await putRequest<IUpdateAssignmentSubmissionBody, IAssignmentSubmission>(
            `/assignments/${assignmentId}/submissions/${submissionId}`,
            data,
        );
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async getAssignmentSubmissionsOfStudents({ assignmentId }: { assignmentId: number }) {
        const response = await getRequest<unknown, IAssignmentSubmissionWithStudent[]>(
            `/assignments/${assignmentId}/submissions/all`,
        );
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }

    public async gradeAssignmentSubmission({ assignmentId, submissionId, grade }: IGradeAssignmentSubmissionPayload) {
        const response = await putRequest<{ grade: number }, IAssignmentSubmission>(
            `/assignments/${assignmentId}/submissions/${submissionId}/grade`,
            { grade },
        );
        if (response.status !== 'success') {
            throw new Error(response.message);
        }
        return response.data;
    }
}

export default new AssignmentSubmissionService();
