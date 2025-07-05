import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CircleUserRound, School } from 'lucide-react';
import { useState } from 'react';

type ILearningMode = 'personal' | 'class-based';

export function LearningModeSelect() {
    const [learningMode, setLearningMode] = useState<ILearningMode>('personal');
    return (
        <Select >
            <SelectTrigger className="w-[130px] bg-background text-foreground border-border" aria-label="Select theme">
                <SelectValue placeholder="Select theme">
                    <div className="flex items-center gap-2">
                        
                    </div>
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="personal">
                    <div className="flex items-center gap-2">
                        <CircleUserRound className="h-4 w-4" />
                        <span>Personal</span>
                    </div>
                </SelectItem>
                <SelectItem value="class-based">
                    <div className="flex items-center gap-2">
                        <School className="h-4 w-4" />
                        <span>Class-based</span>
                    </div>
                </SelectItem>
            </SelectContent>
        </Select>
    );
}
