export type FeedbackStatus = 'new' | 'reviewed' | 'ignored' | 'resolved';
export type FeedbackCategory = 'bug' | 'feature' | 'praise' | 'other';

export interface AdminFeedbackItem {
    feedbackId: number;
    message: string;
    imageUrl?: string | null;
    hasImage: boolean;
    isImportant: boolean;
    score: number;
    reasons?: string | null; // stored as JSON string array in DB
    status: FeedbackStatus;
    category?: FeedbackCategory | null;
    userId?: number | null;
    userEmail?: string | null;
    userName?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface GetAdminFeedbackQuery {
    page?: number;
    limit?: number;
    minScore?: number;
    maxScore?: number;
    hasImage?: boolean;
    status?: FeedbackStatus;
    category?: FeedbackCategory;
    search?: string;
    importantOnly?: boolean;
}

export interface AdminFeedbackListResponse {
    items: AdminFeedbackItem[];
    total: number;
    page: number;
    limit: number;
}

export type UpdateFeedbackPayload = Partial<Pick<AdminFeedbackItem, 'status' | 'category'>>;
