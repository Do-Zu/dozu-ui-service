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
}

export default new ToastHelper();
