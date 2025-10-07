import usePost from '@/hooks/usePost';
import type {
    FeynmanSessionUpdate,
    IFeynmanSession,
    IFeynmanSessionRequest,
    IGetSession,
} from '@/services/feynman/feynman.service';
import { feynmanService } from '@/services/feynman/feynman.service';

export const useFeynmanService = () => {
    const fetch = usePost<IGetSession, IFeynmanSession>(feynmanService.getSessionFeynman);

    const update = usePost<FeynmanSessionUpdate, unknown>(feynmanService.updateSession);

    const storage = usePost<IFeynmanSessionRequest, IFeynmanSessionRequest>(feynmanService.storageQuestions);

    return {
        get: {
            data: fetch.data,
            loading: fetch.loading,
            error: fetch.error,
            fetch: fetch.execute,
            refetch: fetch.reset,
        },
        update: {
            execute: update.execute,
            data: update.data,
            loading: update.loading,
            error: update.error,
            reset: update.reset,
        },
        storage: {
            execute: storage.execute,
            data: storage.data,
            loading: storage.loading,
            error: storage.error,
            reset: storage.reset,
        },
    };
};
