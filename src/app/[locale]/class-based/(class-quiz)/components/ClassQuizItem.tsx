'use client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ClipboardCheck, Edit, MoreVertical, Play, Pause, PlayCircle, ShieldX, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { DATE_DMY_DASH_FORMAT } from '@/utils/date/constant';
import { formatDate } from '@/utils';
import { USER_ROLES, UserRole } from '@/utils/constants/roles';
import { IClassQuizListItem } from '../types/classQuiz.type';
import classQuizTeacherService from '../services/classQuizTeacher.service';
import { ROUTES } from '@/utils/constants/routes';
import { toast } from '@/hooks/use-toast';

interface Props {
    role: UserRole;
    quiz: IClassQuizListItem;
    onRemoved?: (id: number) => void;
    classIdForRoute?: number;
}

export default function ClassQuizItem({ role, quiz, classIdForRoute }: Props) {
    const tCommon = useTranslations('common');
    const router = useRouter();

    if (role === USER_ROLES.USER && quiz.status !== 'published') {
        return null;
    }

    const statusBadge =
        quiz.status === 'draft' ? (
            <Badge variant="secondary">Draft</Badge>
        ) : quiz.status === 'scheduled' ? (
            <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400">Scheduled</Badge>
        ) : quiz.status === 'published' ? (
            <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">Published</Badge>
        ) : (
            <Badge variant="outline">Closed</Badge>
        );

    // helper format date + time
    const formatDateTime = (value?: string | null) => {
        if (!value) return '—';
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return '—';

        const datePart = formatDate(d, DATE_DMY_DASH_FORMAT);
        const timePart = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return `${datePart} ${timePart}`;
    };

    const subtitle = (() => {
        const s = formatDateTime(quiz.startAt);
        const e = formatDateTime(quiz.endAt);

        if (quiz.publishedAt) {
            const p = formatDateTime(quiz.publishedAt);
            return `Published: ${p} · Time: ${s} → ${e}`;
        }

        if (quiz.startAt || quiz.endAt) {
            return `Time: ${s} → ${e}`;
        }

        return '—';
    })();

    const handleEditClick = () => {
        // draft / scheduled -> edit
        if (quiz.status === 'draft' || quiz.status === 'scheduled') {
            router.push(ROUTES.TEACHER.CLASS_BASED_ID_CLASS_QUIZ_EDIT(classIdForRoute!, quiz.classQuizId));
            return;
        }
        // published / closed -> show toast
        toast({
            title: 'This quiz cannot be edited.',
            description:
                quiz.status === 'published'
                    ? 'The quiz has been published. If you need to edit it, create a new quiz.'
                    : 'The quiz has been closed. You can no longer edit its content.',
            variant: 'destructive',
        });
    };

    const canStudentSeeStartButton = quiz.status === 'published' && !!quiz.acceptingSubmissions;

    const handleStudentStart = () => {
        if (!classIdForRoute) return;

        const now = new Date();
        const start = quiz.startAt ? new Date(quiz.startAt) : null;
        const end = quiz.endAt ? new Date(quiz.endAt) : null;

        if (start && now < start) {
            const startLabel = quiz.startAt ? formatDate(quiz.startAt, DATE_DMY_DASH_FORMAT) : '';
            toast({
                title: 'Quiz has not started yet',
                description: `This quiz will open at ${startLabel}.`,
                variant: 'destructive',
            });
            return;
        }

        if (end && now > end) {
            const endLabel = formatDate(quiz.endAt!, DATE_DMY_DASH_FORMAT);
            toast({
                title: 'Quiz has already ended',
                description: `This quiz closed at ${endLabel}.`,
                variant: 'destructive',
            });
            return;
        }

        router.push(ROUTES.STUDENT.CLASS_BASED_ID_CLASS_QUIZ_START(classIdForRoute, quiz.classQuizId));
    };

    return (
        <div className="flex items-center justify-between py-5 px-3 hover:bg-muted/50 rounded-md">
            <div className="flex items-center gap-4">
                <div
                    className={cn(
                        'flex items-center justify-center h-9 w-9 rounded-full border-2',
                        quiz.status === 'draft'
                            ? 'border-muted-foreground/50 bg-muted/30'
                            : 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30',
                    )}
                >
                    <ClipboardCheck
                        className={cn(quiz.status === 'draft' ? 'text-muted-foreground/80' : 'text-emerald-500')}
                        size={18}
                    />
                </div>
                <div className="flex flex-col">
                    <div className="font-medium text-base text-foreground">{quiz.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">{subtitle}</div>

                    {quiz.status === 'scheduled' && quiz.autoPublishError && (
                        <div className="text-xs text-destructive mt-1">
                            Auto publish failed: {quiz.autoPublishError}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3">
                {statusBadge}
                {role === USER_ROLES.USER ? (
                    canStudentSeeStartButton ? (
                        <Button size="sm" onClick={handleStudentStart}>
                            <Play className="mr-2 h-4 w-4" /> Start
                        </Button>
                    ) : null
                ) : (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={handleEditClick}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>{tCommon('actions.edit')}</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onSelect={() =>
                                    router.push(
                                        ROUTES.TEACHER.CLASS_BASED_ID_CLASS_QUIZ_ACTIVITY(
                                            classIdForRoute!,
                                            quiz.classQuizId,
                                        ),
                                    )
                                }
                            >
                                <Info className="mr-2 h-4 w-4" />
                                <span>Activity</span>
                            </DropdownMenuItem>

                            {quiz.status === 'published' && quiz.acceptingSubmissions ? (
                                <DropdownMenuItem onSelect={() => classQuizTeacherService.pause(quiz.classQuizId)}>
                                    <Pause className="mr-2 h-4 w-4" />
                                    <span>Pause submissions</span>
                                </DropdownMenuItem>
                            ) : quiz.status === 'published' ? (
                                <DropdownMenuItem onSelect={() => classQuizTeacherService.resume(quiz.classQuizId)}>
                                    <PlayCircle className="mr-2 h-4 w-4" />
                                    <span>Resume submissions</span>
                                </DropdownMenuItem>
                            ) : null}

                            {quiz.status !== 'closed' ? (
                                <DropdownMenuItem onSelect={() => classQuizTeacherService.close(quiz.classQuizId)}>
                                    <ShieldX className="mr-2 h-4 w-4" />
                                    <span>Close quiz</span>
                                </DropdownMenuItem>
                            ) : null}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    );
}
