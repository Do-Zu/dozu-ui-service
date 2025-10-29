export interface IClass {
    classId: number;
    name: string;
    description: string;
    invitationCode: string;
    createdAt: Date;

    // optional (teacher)
    teacherId?: number;
    teacherName?: string | null;
    teacherImageUrl?: string;

    imageUrl?: string | null;

    // only for student
    classEnrollmentId?: number;
    enrolledAt?: Date;
}

export type ICreateClassBody = Pick<IClass, 'name' | 'description'> & { imageFile?: File | null };
export type ICreateClassResponse = Pick<
    IClass,
    'classId' | 'name' | 'description' | 'invitationCode' | 'createdAt' | 'imageUrl'
>;
export type IUpdateClassBody = Pick<IClass, 'name' | 'description'> & { imageFile?: File | null };
export type IUpdateClassResponse = Pick<IClass, 'classId' | 'name' | 'description' | 'imageUrl'>;

export interface IJoinClassBody {
    invitationCode: string;
}

export interface IStudentInClass {
    userId: number;
    username: string;
    fullName: string | null;
    avatarUrl: string;
    enrolledAt: Date;
}

export interface StudentWithStreak extends IStudentInClass {
    currentStreak?: number;
    points?: number;
    rank?: number | null;
    lessonsCompleted?: number;
    quizzesCompleted?: number;
    averageScore?: number;
    streakFreezeActive?: boolean;
    streakFreezeCount?: number;
    lastStudyDate?: Date | null;
}

export type TypeNodeComment = 'mindmap' | 'flashcard' | 'quiz';

export enum EnumNodeComment {
    MINDMAP = 'mindmap',
    FLASHCARD = 'flashcard',
    QUIZ = 'quiz',
}
