import { Album, FileText, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/utils';
import { cn } from '@/lib/utils';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/constants/routes';

interface LearningMaterialItemProps {
    material: {
        learningMaterialId: number;
        classId: number;
        topicId?: number | null;
        title: string;
        content?: string;
        createdAt: string;
    };
}

const LearningMaterialItem: React.FC<LearningMaterialItemProps> = ({ material }) => {
    const router = useRouter();

    function handleViewClick() {
        // router.push(ROUTES.TEACHER.CLASS_BASED_ID_LEARNING_MATERIAL(material.classId));
        // router.push('/teacher/class-based/1/learning-material/1'); //!hardcoded
    }

    // const handleOnClickLearningMaterial = () => {
    // };

    return (
        <div className="flex items-center justify-between py-5 px-3 hover:bg-muted/50 rounded-md transition-colors">
            <div className="flex items-center gap-4">
                <div className="flex items-center justify-center h-9 w-9 rounded-full border-2 border-blue-400 bg-blue-50 dark:bg-blue-950/30">
                    <Album className="text-blue-500 dark:text-blue-400" size={18} />
                </div>
                <div className="flex flex-col">
                    <a
                        onClick={handleViewClick}
                        className="font-medium text-base text-foreground cursor-pointer hover:underline"
                    >
                        {material.title}
                    </a>
                    {material.content && <p className="text-sm text-muted-foreground">{material.content}</p>}
                </div>
            </div>

            <div className="flex items-center gap-4 md:gap-6">
                <p className="text-sm text-muted-foreground">{formatDate(material.createdAt)}</p>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        >
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={handleViewClick}>Xem chi tiết</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => {}}>Xóa</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};

export default LearningMaterialItem;
