import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ILearningMode, setLearningMode } from '@/stores/features/class-based-learning/learningModeSlice';
import { CircleUserRound, School } from 'lucide-react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/constants/routes';

function Personal() {
    return (
        <div className="flex items-center gap-2">
            <CircleUserRound className="h-4 w-4" />
            <span>Personal</span>
        </div>
    );
}

function ClassBased() {
    return (
        <div className="flex items-center gap-2">
            <School className="h-4 w-4" />
            <span>Class-based</span>
        </div>
    );
}

export function LearningModeSelect() {
    const dispatch = useDispatch();
    const [storedValue, setValue] = useLocalStorage<ILearningMode>('learningMode', 'personal');
    const router = useRouter();

    useEffect(() => {
        dispatch(setLearningMode(storedValue));
        if (storedValue === 'personal') {
            router.push(ROUTES.HOME);
        } else {
            router.push(ROUTES.CLASS_BASED);
        }
    }, [storedValue]);

    function handleLearningModelSelect(mode: ILearningMode) {
        setValue(mode);
    }

    return (
        <Select value={storedValue} onValueChange={handleLearningModelSelect}>
            <SelectTrigger
                className="ml-8 w-[150px] bg-background text-foreground border-border"
                aria-label="Select theme"
            >
                <SelectValue>{storedValue === 'personal' ? <Personal /> : <ClassBased />}</SelectValue>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="personal">
                    <Personal />
                </SelectItem>
                <SelectItem value="class-based">
                    <ClassBased />
                </SelectItem>
            </SelectContent>
        </Select>
    );
}
