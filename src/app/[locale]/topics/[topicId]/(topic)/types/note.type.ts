export type ContentReferenceType = 'youtube' | 'pdf' | 'audio' | 'video';

export interface IContentReference {
    type: ContentReferenceType;
    timestamp?: number; // For video/audio/youtube (seconds)
    page?: number; // For PDF
    videoId?: string; // For YouTube
}

export interface INoteSegment {
    id: string;
    text: string;
    reference?: IContentReference;
}

export interface INote {
    noteId: number;
    topicId: number;
    userId: number;
    content: string;
    // Optional: segments with reference information
    segments?: INoteSegment[];
}

export type IUpdateNotePayload = {
    topicId: number;
    content?: string | undefined;
    // Optional: segments with reference information
    segments?: INoteSegment[];
};

export type IUpdateNoteBody = {
    content?: string | undefined;
    // Optional: segments with reference information
    segments?: INoteSegment[];
};
