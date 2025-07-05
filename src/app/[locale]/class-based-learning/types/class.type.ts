export interface IClass {
    classId: number;
    teacherId?: number;
    imageUrl?: string;
    name: string;
    description: string;
    invitationCode: string;
    createdAt: Date;

    // only for student
    classEnrollmentId?: number;
    enrolledAt?: Date;
}

export type ICreateClassRequest = Pick<IClass, 'name' | 'description'>;
export type ICreateClassResponse = Pick<IClass, 'classId' | 'name' | 'description' | 'invitationCode' | 'createdAt'>;
export type IUpdateClassRequest = Pick<IClass, 'classId' | 'name' | 'description'>;
export type IUpdateClassResponse = Pick<IClass, 'classId' | 'name' | 'description'>;
