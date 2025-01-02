import Axios from './axios';

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
    const response = await Axios.post<R>(url, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const putRequest = async <T, R>(url: string, data: T): Promise<R> => {
  try {
    const response = await Axios.put<R>(url, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteRequest = async <T>(url: string): Promise<T> => {
  try {
    const response = await Axios.delete<T>(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};
