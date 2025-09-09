export type ITeacherRequestStatus = 'pending' | 'approved' | 'rejected';

export interface ITeacherRequest {
    requestId: number;
    userId: number;
    description: string;
    status: ITeacherRequestStatus;
    createdAt: Date;

    userInfo?: {
        userId: number;
        username: string;
        fullName: string | null;
        avatarUrl: string;
    }
}