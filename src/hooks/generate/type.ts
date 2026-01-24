import { NodesData } from '@/app/[locale]/topics/[topicId]/(topic)/types/generate.type';

export interface ICommonGenerateOptions {
    numberOfItem: number;
    difficulty: string;
    focus: string;
    listType: string[];
}

export interface IGenerateOptions {
    commonGenerateOptions?: ICommonGenerateOptions;
    nodesData?: NodesData;
}

export interface IGenerateRequest {
    content: string;
    method: string;
    type: string;
    options?: IGenerateOptions;
}

interface ValidateDataSuccess<TRes> {
    ok: true;
    data: TRes;
}

interface ValidateDataError<TRes> {
    ok: false;
    error: unknown;
    data?: TRes;
}

export type ValidateGeneratedDataResult<TRes> = ValidateDataSuccess<TRes> | ValidateDataError<TRes>;
export type ValidateGeneratedDataFn<TRes> = (data: TRes) => ValidateGeneratedDataResult<TRes>;
