import Axios from './axios';
import { addTimezoneInfo } from '../utils/date/apiDateUtils';
import { ApiResponse } from './type';

export type RequestData = Record<string, any> | FormData | void | null | undefined;

export const getRequest = async <T, R>(url: string): Promise<ApiResponse<R>> => {
    try {
        const response = await Axios.get<T>(url);
        return response.data as ApiResponse<R>;
    } catch (error) {
        throw error;
    }
};

export const postRequest = async <T extends RequestData, R>(url: string, data: T): Promise<ApiResponse<R>> => {
    try {
        const enhancedData = addTimezoneInfo(data);
        const response = await Axios.post<ApiResponse<R>>(url, enhancedData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const putRequest = async <T extends RequestData, R>(url: string, data: T): Promise<ApiResponse<R>> => {
    try {
        const enhancedData = addTimezoneInfo(data);
        const response = await Axios.put<ApiResponse<R>>(url, enhancedData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const patchRequest = async <T extends RequestData, R>(url: string, data: T): Promise<ApiResponse<R>> => {
    try {
        const enhancedData = addTimezoneInfo(data);
        const response = await Axios.patch<ApiResponse<R>>(url, enhancedData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteRequest = async <T extends RequestData, R>(url: string, data?: T): Promise<R> => {
    try {
        if (data) {
            const enhancedData = addTimezoneInfo(data);
            const response = await Axios.delete<R>(url, { data: enhancedData });
            return response.data;
        }

        const response = await Axios.delete<R>(url);
        return response.data;
    } catch (error) {
        throw error;
    }
};
