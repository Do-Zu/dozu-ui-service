import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import Image from 'next/image';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { IClass } from '../../types/class.type';

interface Props {
    classProp: IClass;
    handleNameClick: ({ classId, name, description }: { classId: number; name: string; description: string }) => void;
}

export function StudentClassCard({ classProp, handleNameClick }: Props) {
    const {
        classId,
        name,
        description,
        imageUrl,
        enrolledAt,
        teacherName,
        teacherImageUrl,
    } = classProp;

    function formatDate(date: Date | undefined) {
        if (date) return format(date, 'yyyy-MM-dd');
        return null;
    }

    return (
        <Card className="overflow-hidden transition-all duration-200 hover:shadow-md hover:cursor-pointer bg-gray-50 dark:bg-gray-600">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="w-full flex flex-row gap-4 text-lg font-medium truncate">
                        <Avatar>
                            <AvatarImage src={teacherImageUrl} alt="Avatar" />
                        </Avatar>
                        <div className="flex flex-row gap-2 items-center">
                            <div
                                className="hover:underline hover:text-blue-400 transition"
                                onClick={() => handleNameClick({ classId, name, description })}
                            >
                                {name}
                            </div>
                            <div className="text-sm">({teacherName})</div>
                        </div>
                    </CardTitle>
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
                            Enrolled At: <span className="font-bold">{formatDate(enrolledAt)}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
