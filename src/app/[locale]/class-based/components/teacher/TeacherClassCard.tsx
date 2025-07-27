import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import Image from 'next/image';
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Edit, MoreVertical, Sparkles, Users } from 'lucide-react';
import { IClass } from '../../types/class.type';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/constants/routes';

interface Props {
    classProp: IClass;
    handleUpdateClassSelect: ({
        classId,
        name,
        description,
    }: {
        classId: number;
        name: string;
        description: string;
    }) => void;
    handleNameClick: ({ classId, name, description }: { classId: number; name: string; description: string }) => void;
}

export function TeacherClassCard({ classProp, handleUpdateClassSelect, handleNameClick }: Props) {
    const router = useRouter();
    const {
        classId,
        name,
        description,
        invitationCode,
        imageUrl,
        createdAt,
    } = classProp;

    function formatDate(date: Date | undefined) {
        if (date) return format(date, 'yyyy-MM-dd');
        return null;
    }

    async function handleGenerateClick() {
        router.push(ROUTES.CLASS_BASED_ID_GENERATE(classId));
    }

    async function handleManageStudentsClick() {
        router.push(ROUTES.CLASS_BASED_ID_STUDENTS(classId));
    }

    return (
        <Card className="overflow-hidden transition-all duration-200 hover:shadow-md hover:cursor-pointer bg-gray-50 dark:bg-gray-600">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    {/* Teacher Section */}
                    <CardTitle className="w-full flex flex-row gap-4 text-lg font-medium truncate">
                        <div className="flex flex-row gap-2 items-center">
                            <div
                                className="hover:underline hover:text-blue-400 transition"
                                onClick={() => handleNameClick({ classId, name, description })}
                            >
                                {name}
                            </div>
                            <div className="text-xs text-muted-foreground">({invitationCode})</div>
                        </div>
                    </CardTitle>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:pointer-events-auto">
                                <MoreVertical className="h-4 w-4 text-gray-500" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" side="top">
                            {/* Class itself */}
                            <DropdownMenuItem onSelect={handleGenerateClick}>
                                <Sparkles className="mr-2 h-4 w-4" />
                                <span>Generate Contents</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={handleManageStudentsClick}>
                                <Users className="mr-2 h-4 w-4" />
                                <span>Manage Students</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleUpdateClassSelect({ classId, name, description })}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent>
                <div className="relative h-44 bg-gray-200 dark:bg-gray-400 rounded-md mb-3 flex items-center justify-center">
                    {imageUrl ? (
                        <Image fill className="object-contain" alt="Item Image" src={imageUrl} />
                    ) : (
                        <div className="text-gray-500 dark:text-slate-500 text-lg">Preview</div>
                    )}
                </div>
                <div className="flex flex-col text-xs text-foreground justify-between">
                    <div className="flex flex-row justify-between items-center">
                        <div>
                            Created At: <span className="font-bold">{formatDate(createdAt)}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
