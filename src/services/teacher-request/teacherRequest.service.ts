import { patchRequest, postRequest } from "@/api/api";
import { ITeacherRequest } from "@/app/[locale]/admin/teacher-requests/types/teacherRequest.type";

class TeacherRequestService {
    public async sendRequest(description: string) {
        const result = await postRequest<{ description: string }, ITeacherRequest>('/teacher-requests', { description });
        return result;
    }

    public async approveRequest(requestId: number) {
        const result = await patchRequest<{}, ITeacherRequest>(`/teacher-requests/${requestId}/approve`, {});
        return result;
    }

    public async rejectRequest(requestId: number) {
        const result = await patchRequest<{}, ITeacherRequest>(`/teacher-requests/${requestId}/reject`, {});
        return result;
    }
}

export default new TeacherRequestService();