import { toast } from '@/hooks/use-toast';
import errorHelper from './error.helper';

class ToastHelper {
    public showErrorMessage = (error: unknown): void => {
        if (typeof error === 'string') {
            toast({
                title: error,
                variant: 'destructive',
            });
            return;
        }
        const message = errorHelper.getErrorMessage(error);
        toast({
            title: message,
            variant: 'destructive',
        });
    };

    public showSuccessMessage = (message: string): void => {
        toast({
            title: message,
            variant: 'default',
        });
    };

    public showLog = (log?: unknown, ...optionalParams: unknown[]) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(log, ...optionalParams);
        }
    };
}

export default new ToastHelper();
