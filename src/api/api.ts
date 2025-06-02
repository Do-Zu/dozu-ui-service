import Axios from './axios';
import { addTimezoneInfo } from '../utils/date/apiDateUtils';

export const getRequest = async <T>(url: string): Promise<T> => {
  try {
    const response = await Axios.get<T>(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const postRequest = async <T, R>(url: string, data: T): Promise<R> => {
  try {
    const enhancedData = addTimezoneInfo(data);
    const response = await Axios.post<R>(url, enhancedData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const putRequest = async <T, R>(url: string, data: T): Promise<R> => {
  try {
    const enhancedData = addTimezoneInfo(data);
    const response = await Axios.put<R>(url, enhancedData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteRequest = async <T, R>(url: string, data?: T): Promise<R> => {
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
