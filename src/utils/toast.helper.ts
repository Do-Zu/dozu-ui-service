import { toast } from '@/hooks/use-toast';
import errorHelper from './error.helper';

class ToastHelper {
    public showErrorMessage = (error: unknown): void => {
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
}

export default new ToastHelper();
