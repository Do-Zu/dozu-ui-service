import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IClass } from '../../../types/class.type';
import { ShowIf } from '@/components/ui/ShowIf';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
import Image from 'next/image';
import { formatDate } from '@/utils';
import roleHelper from '@/utils/role.helper';

interface BaseProps {
    myClass: IClass;
    handleNameClick: ({ classId }: { classId: number }) => void;
    menuContent: (myClass: IClass) => React.ReactNode;
}

interface TeacherProps {
    role: 'teacher';
}

interface StudentProps {
    role: 'student';
}

type Props = BaseProps & (TeacherProps | StudentProps);

export default function ClassCard({ role, myClass, handleNameClick, menuContent }: Props) {
    const { classId, name, description, imageUrl } = myClass;
    const { createdAt, teacherName, teacherImageUrl } = myClass;
    const { enrolledAt } = myClass;

    return (
        <Card className="overflow-hidden transition-all duration-200 hover:shadow-md hover:cursor-pointer bg-gray-50 dark:bg-gray-600">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="w-full flex flex-row gap-4 text-lg font-medium truncate">
                        <ShowIf when={roleHelper.isStudent(role)}>
                            <Avatar>
                                <AvatarImage src={teacherImageUrl} alt="Avatar" />
                            </Avatar>
                        </ShowIf>
                        <div className="flex flex-row gap-2 items-center">
                            <div
                                className="hover:underline hover:text-blue-400 transition"
                                onClick={() => handleNameClick({ classId })}
                            >
                                {name}
                            </div>
                        </div>
                    </CardTitle>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:pointer-events-auto">
                                <MoreVertical className="h-4 w-4 text-gray-500" />
                            </Button>
                        </DropdownMenuTrigger>
                        {menuContent(myClass)}
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent>
                <div
                    className={`relative h-44 rounded-md mb-3 flex items-center justify-center ${
                        !imageUrl ? 'bg-gray-200 dark:bg-gray-400' : ''
                    }`}
                >
                    {imageUrl ? (
                        <Image fill className="object-contain" alt="Item Image" src={imageUrl} />
                    ) : (
                        <div className="text-gray-500 dark:text-slate-500 text-lg">Preview</div>
                    )}
                </div>
                <div className="flex flex-col text-xs text-foreground justify-between">
                    <div className="flex flex-row justify-between items-center">
                        <div>
                            {roleHelper.isTeacher(role) ? (
                                <>
                                    Created At: <span className="font-bold">{formatDate(createdAt)}</span>
                                </>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-row gap-2">
                                        Your teacher: <span className="font-bold">{teacherName}</span>
                                    </div>
                                    <div className="flex flex-row gap-2">
                                        Enrolled At: <span className="font-bold">{formatDate(enrolledAt!)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
