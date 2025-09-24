// for use inside custom node, since custom node cannot access router
import { useRouter } from 'next/navigation';

let _router: ReturnType<typeof useRouter> | null = null;

export const setRouterRef = (router: ReturnType<typeof useRouter>) => {
    _router = router;
};

export const getRouter = () => {
    if (!_router) throw new Error('Router is not set.');
    return _router;
};
