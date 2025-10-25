export interface IItemScheduleGenerated {
    topicId: number;
    priority: number;
    startTime: Date;
    endTime: Date;
    title: string;
    description: string | null;
    type: string;
    amountItem: number;
}

export interface IScheduleRequest {
    schedules: Record<string, IItemScheduleGenerated[]>;
}

export interface IBatchUpdateRequest {
    fromDate: Date;
    toDate: Date;
    updates: IScheduleRequest;
}

export interface DraggedEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    topicId: number;
    type: string;
    priority: number;
    description: string | null;
    amountItem: number;
}
