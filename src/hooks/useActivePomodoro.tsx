/**
 *
 */

import { IPropPomodoro } from '@/components/pomodoro/Pomodoro';
import { setDisplayPomodoro } from '@/stores/features/pomodoro/pomodoroSlice';
import { useAppDispatch } from '@/stores/hooks';
import { useEffect } from 'react';

type IArgPomodoro = Partial<Pick<IPropPomodoro, 'positionX' | 'positionY' | 'position'>>;

export default function useActivePomodoro(options?: IArgPomodoro) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(setDisplayPomodoro(true));
        () => {
            dispatch(setDisplayPomodoro(false));
        };
    }, []);
}
