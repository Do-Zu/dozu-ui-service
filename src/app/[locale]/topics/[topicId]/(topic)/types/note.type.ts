export interface INote {
    noteId: number;
    topicId: number;
    userId: number;
    content: string;
}

export type IUpdateNotePayload = {
    topicId: number;
    content?: string | undefined;
};

export type IUpdateNoteBody = {
    content?: string | undefined;
};
