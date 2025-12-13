export interface IInputSetResponse {
    setId: number;
    contentType: string | null;
    description: string | null;
    title: string;
    data: any;
}

export interface ITranscriptSegment {
    startTime: number;
    endTime: number;
    text: string;
}

export enum EnumLearningMaterial {
    file = 'file',
    youtube = 'youtube',
    media = 'media',
}
