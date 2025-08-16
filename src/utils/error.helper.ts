import { AxiosError } from "axios";

class ErrorHelper {
    // this function gets message from error object (from AxiosError, Error, or unknown error)
    public getErrorMessage = (error: unknown): string => {
        if (error instanceof AxiosError) {
            let message: string;
            if (error.response && error.response.data && typeof error.response.data.message === 'string') {
                message = error.response.data.message;
            } else if (typeof error.message === 'string') {
                message = error.message;
            } else {
                message = 'Axios Error occured';
            }
            return message;
        }

        if (error instanceof Error) {
            return error.message;
        }
        return 'Unknown Error occured';
    };
}


export default new ErrorHelper();