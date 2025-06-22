export interface UserBasic {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
}
