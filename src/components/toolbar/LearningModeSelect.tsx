import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ILearningMode, setLearningMode } from '@/stores/features/class-based-learning/learningModeSlice';
import { CircleUserRound, School } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/constants/routes';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';

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
    const [storedValue, setValue] = useLocalStorage<ILearningMode>('learningMode', MODE_ACCESS_PAGE_ROLE.personal);
    const [isMounted, setIsMounted] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        if (!isMounted) {
            setIsMounted(true);
            return;
        }
        // dispatch(setLearningMode(storedValue));
        if (storedValue === MODE_ACCESS_PAGE_ROLE.personal) {
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
                <SelectValue>
                    {storedValue === MODE_ACCESS_PAGE_ROLE.personal ? <Personal /> : <ClassBased />}
                </SelectValue>
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
