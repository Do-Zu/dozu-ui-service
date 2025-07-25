export interface ITimeSlot {
    startTime: string;
    endTime: string;
}

export interface IFreeTime {
    Monday?: ITimeSlot[];
    Tuesday?: ITimeSlot[];
    Wednesday?: ITimeSlot[];
    Thursday?: ITimeSlot[];
    Friday?: ITimeSlot[];
    Saturday?: ITimeSlot[];
    Sunday?: ITimeSlot[];
}

export interface IPreferences {
    studyMethods: string[];
    studyDuration: number;
    interestedTopicTags: string[];
    onboardingCompletedAt: string;
    studyPreferences: string[];
}

export interface ISchedulePreference {
    preferences: IPreferences;
    avgStudyDuration: number | null;
    freeTime: IFreeTime;
}

export interface IUpdateSchedulePreferencePayload {
    preferences: IPreferences;
    avgStudyDuration: number | null;
    freeTime: IFreeTime;
}

export interface IGetSchedulePreferenceResponse {
    preferences: IPreferences;
    avgStudyDuration: number | null;
    freeTime: IFreeTime;
}
