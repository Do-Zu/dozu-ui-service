import { IAssignmentSubmissionStatus, IAssignmentSubmissionWithStudent } from '../types/assignmentSubmission.type';

class AssignmentSubmissionUtils {
    public getStatusLabel(status: IAssignmentSubmissionStatus) {
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
        studentSubmissions: IAssignmentSubmissionWithStudent[];
    }) {
        if (!status) return studentSubmissions;
        const result = studentSubmissions.filter((studentSubmission) => studentSubmission.submission.status === status);
        return result;
    }
}

export default new AssignmentSubmissionUtils();
