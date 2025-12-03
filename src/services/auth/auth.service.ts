import { postRequest } from '@/api/api';

export interface IVerifyEmailBody {
    email: string;
    verificationCode: string;
}

const BASE_URL = 'auth';

export class AuthService {
    /**
     * get session
     */
    async verifyEmail(request: IVerifyEmailBody): Promise<any> {
        const response = await postRequest<IVerifyEmailBody, any>(`${BASE_URL}/verify-email`, request);
        return response.data;
    }
}

export const authService = new AuthService();
