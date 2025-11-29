import {
    AssignmentSubmissionStatusEnum,
    IAssignmentSubmissionStatus,
    IAssignmentSubmissionWithStudent,
    IAssignmentSubmissionWithStudentDetails,
} from '../types/assignmentSubmission.type';

class AssignmentSubmissionUtils {
    public getStatusLabel(status: IAssignmentSubmissionStatus = AssignmentSubmissionStatusEnum.DRAFT) {
        switch (status) {
            case 'draft': {
                return 'Đã giao';
            }
            case 'submitted': {
                return 'Đã nộp';
            }
            case 'returned': {
                return 'Đã chấm điểm';
            }
            default: {
                return 'Giá trị không hợp lệ';
            }
        }
    }

    public getAssignmentSubmissionsByStatus({
        status,
        studentSubmissions,
    }: {
        status: IAssignmentSubmissionStatus | null;
        studentSubmissions: IAssignmentSubmissionWithStudentDetails[];
    }) {
        if (!status) return studentSubmissions;
        const result = studentSubmissions.filter((studentSubmission) => {
            if (!studentSubmission.submission) return status === AssignmentSubmissionStatusEnum.DRAFT;
            return studentSubmission.submission.status === status;
        });
        return result;
    }

    public getAssignmentSubmissionStatusCounts(studentSubmissions: IAssignmentSubmissionWithStudentDetails[]) {
        const result = {
            assignedCount: 0,
            submittedCount: 0,
            returnedCount: 0,
        };
        for (const studentSubmission of studentSubmissions) {
            const status = studentSubmission.submission?.status;
            if (!status) result.assignedCount++;
            if (status === AssignmentSubmissionStatusEnum.DRAFT) result.assignedCount++;
            if (status === AssignmentSubmissionStatusEnum.SUBMITTED) result.submittedCount++;
            if (status === AssignmentSubmissionStatusEnum.RETURNED) result.returnedCount++;
        }
        return result;
    }
}

export default new AssignmentSubmissionUtils();
