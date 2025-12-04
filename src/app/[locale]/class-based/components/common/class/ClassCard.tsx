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
import { BackgroundGradientCard } from '@/components/common/BackgroundGradientCard';

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

export type ClassCardProps = BaseProps & (TeacherProps | StudentProps);

const ClassCard: React.FC<ClassCardProps> = ({ role, myClass, handleNameClick, menuContent }) => {
    const { classId, name, description, imageUrl } = myClass;
    const { createdAt, teacherName, teacherImageUrl } = myClass;
    const { enrolledAt } = myClass;

    return (
        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-primary/50 cursor-pointer bg-card border border-border shadow-md rounded-xl">
            <BackgroundGradientCard />
            <div className="relative z-10">
                <CardHeader className="pb-2 px-5 pt-5">
                    <div className="flex justify-between items-start gap-3">
                        <CardTitle className="flex-1 flex flex-row gap-3 text-base font-semibold truncate text-foreground">
                            <ShowIf when={roleHelper.isStudent(role)}>
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                    <AvatarImage src={teacherImageUrl} alt="Avatar" />
                                </Avatar>
                            </ShowIf>
                            <div
                                className="group relative cursor-pointer truncate font-semibold transition-all duration-300"
                                onClick={() => handleNameClick({ classId })}
                            >
                                <span className="opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                                    {name}
                                </span>
                                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-primary via-primary to-primary/95 bg-clip-text text-transparent truncate transition-opacity duration-300">
                                    {name}
                                </span>
                            </div>
                        </CardTitle>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 hover:bg-muted rounded-lg flex-shrink-0"
                                >
                                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            {menuContent(myClass)}
                        </DropdownMenu>
                    </div>
                </CardHeader>
            <CardContent className="px-5 pb-5">
                <div
                    className={`relative h-44 rounded-xl mb-4 flex items-center justify-center overflow-hidden ${
                        !imageUrl ? 'bg-muted' : ''
                    }`}
                >
                    {imageUrl ? (
                        <Image fill className="object-cover" alt="Item Image" src={imageUrl} />
                    ) : (
                        <div className="text-muted-foreground text-sm font-medium">Preview</div>
                    )}
                </div>
                <div className="flex flex-col text-xs text-muted-foreground">
                    <div className="flex flex-row justify-between items-center">
                        <div>
                            {roleHelper.isTeacher(role) ? (
                                <span className="text-xs">
                                    Created <span className="font-medium text-foreground">{formatDate(createdAt)}</span>
                                </span>
                            ) : (
                                <div className="flex flex-col gap-1.5">
                                    <div className="text-xs">
                                        Teacher: <span className="font-medium text-foreground">{teacherName}</span>
                                    </div>
                                    <div className="text-xs">
                                        Enrolled <span className="font-medium text-foreground">{formatDate(enrolledAt!)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
            </div>
        </Card>
    );
}

export default ClassCard;