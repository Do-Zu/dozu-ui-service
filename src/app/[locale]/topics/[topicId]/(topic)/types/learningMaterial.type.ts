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
