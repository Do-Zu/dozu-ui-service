import { useMemo } from 'react';
import { toast } from 'sonner';
import RenderProgress from '../components/upload/RenderProgress';

export default function useToastManager() {
    const toastManager = useMemo(
        () => ({
            ids: [] as (string | number)[],

            showProgress: (message: string) => {
                const id = toast(<RenderProgress message={message} isProcessing={true} />, { duration: Infinity });
                toastManager.ids.push(id);
                return id;
            },

            updateProgress: (id: string | number, message: string) => {
                toast(<RenderProgress message={message} />, { id, duration: Infinity });
            },

            dismissAll: () => {
                toastManager.ids.forEach((id) => toast.dismiss(id));
                toastManager.ids.length = 0;
            },

            showSuccess: (message: string) => {
                toast.info(<RenderProgress message={message} />, { duration: 2000 });
            },

            showError: (message: string) => {
                toast.error(<RenderProgress message={message} />, { duration: 4000 });
            },
        }),
        [],
    );

    return toastManager;
}
