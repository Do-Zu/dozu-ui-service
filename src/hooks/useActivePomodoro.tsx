import { useEffect } from 'react';
import { useAppDispatch } from '@/stores/hooks';
import { setDisplayPomodoro } from '@/stores/features/pomodoro/pomodoroSlice';
import { IPropPomodoro } from '@/components/pomodoro/Pomodoro';

type IArgPomodoro = Partial<Pick<IPropPomodoro, 'positionX' | 'positionY' | 'position'>>;

export default function useActivePomodoro(options?: IArgPomodoro) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(setDisplayPomodoro(true));
        return () => {
            dispatch(setDisplayPomodoro(false));
        };
    }, [dispatch]);
}
