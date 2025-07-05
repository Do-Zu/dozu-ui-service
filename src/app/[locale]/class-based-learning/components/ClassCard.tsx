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
import { Edit, MoreVertical, Trash2 } from 'lucide-react';
import { IClass } from '../types/class.type';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useRoleChecker } from '@/hooks/useRoleChecker';

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

export function ClassCard({ classProp, handleUpdateClassSelect, handleNameClick }: Props) {
    const { classId, name, description, invitationCode, imageUrl, createdAt, enrolledAt } = classProp;
    const { isTeacher } = useRoleChecker();
    return (
        <Card className="overflow-hidden transition-all duration-200 hover:shadow-md hover:cursor-pointer bg-gray-50 dark:bg-gray-600">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-medium truncate">
                        <div className="flex flex-row items-center gap-2">
                            <div
                                className="hover:underline hover:text-blue-400 transition"
                                onClick={() => handleNameClick({ classId, name, description })}
                            >
                                {name}
                            </div>
                            {isTeacher ? <div className="text-xs text-muted-foreground">({invitationCode})</div> : null}
                        </div>
                    </CardTitle>
                    {isTeacher ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:pointer-events-auto">
                                    <MoreVertical className="h-4 w-4 text-gray-500" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" side="top">
                                {/* Class itself */}
                                <DropdownMenuItem
                                    onSelect={() => handleUpdateClassSelect({ classId, name, description })}
                                >
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : null}
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
                        {isTeacher ? (
                            <div>
                                Created At: <span className="font-bold">{format(createdAt!, 'yyyy-MM-dd')}</span>
                            </div>
                        ) : (
                            <div>
                                Enrolled At: <span className="font-bold">{format(enrolledAt!, 'yyyy-MM-dd')}</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
