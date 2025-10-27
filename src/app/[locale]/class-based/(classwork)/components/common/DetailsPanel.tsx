'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { IClass } from '../../../types/class.type';
import { ITopic } from '@/app/[locale]/topics/types/topic.type';
import { NO_TOPIC_ID } from '../../utils/classwork.constant';

// if don't use grade or deadline section (like learning materials feature), just pass withGrade false & withDeadline false
interface WithGradeProps {
    withGrade: true;
    grade: number;
    setGrade: React.Dispatch<React.SetStateAction<number>>;
}

interface WithoutGradeProps {
    withGrade: false;
}

interface WithDeadlineProps {
    withDeadline: true;
    deadline: Date | undefined;
    setDeadline: React.Dispatch<React.SetStateAction<Date | undefined>>;
}

interface WithoutDeadlineProps {
    withDeadline: false;
}

interface BaseProps {
    myClass: IClass;
    topics: Pick<ITopic, 'topicId' | 'name'>[];
    withGrade: boolean;
    withDeadline: boolean;
    selectedTopic: string;
    setSelectedTopic: React.Dispatch<React.SetStateAction<string>>;
}

type Props = BaseProps & (WithGradeProps | WithoutGradeProps) & (WithDeadlineProps | WithoutDeadlineProps);

export default function DetailsPanel(props: Props) {
    const { myClass, topics, withGrade, withDeadline, selectedTopic, setSelectedTopic } = props;
    function handleTopicSelect(value: string) {
        setSelectedTopic(value);
    }

    function handleGradeChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (!withGrade) return;
        const value = Number(e.target.value);
        props.setGrade(Math.max(isNaN(value) ? 1 : value, 1));
    }

    function handleDeadlineSelect(value: Date | undefined) {
        if (!withDeadline) return;
        props.setDeadline(value);
    }

    return (
        <Card>
            <CardContent className="pt-6 space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="assign-to-class" className="text-base">
                        Dành cho
                    </Label>
                    <Select defaultValue={myClass.classId.toString()} disabled>
                        <SelectTrigger id="assign-to-class" className="text-base h-11">
                            <SelectValue placeholder="Chọn lớp học" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={myClass.classId.toString()} disabled className="text-base">
                                {myClass.name}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Separator />
                <div className="space-y-2">
                    <Label htmlFor="topic" className="text-base">
                        Chủ đề
                    </Label>
                    <Select defaultValue={NO_TOPIC_ID} value={selectedTopic} onValueChange={handleTopicSelect}>
                        <SelectTrigger id="topic" className="text-base h-11">
                            <SelectValue placeholder="Không có chủ đề" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={NO_TOPIC_ID} className="text-base">
                                Không có chủ đề
                            </SelectItem>
                            {topics.map((topic) => (
                                <SelectItem key={topic.topicId} value={topic.topicId.toString()} className="text-base">
                                    {topic.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Separator />
                {withGrade ? (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="points" className="text-base">
                                Điểm
                            </Label>
                            <Input
                                id="points"
                                type="number"
                                className="text-base h-11"
                                value={props.grade}
                                onChange={handleGradeChange}
                            />
                        </div>
                        <Separator />
                    </>
                ) : null}
                {withDeadline ? (
                    <>
                        <div className="space-y-2">
                            <Label className="text-base">Hạn nộp</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={'outline'}
                                        className={cn(
                                            'w-full justify-start text-left font-normal text-base h-11',
                                            !props.deadline && 'text-muted-foreground',
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {props.deadline ? (
                                            format(props.deadline, 'PPP')
                                        ) : (
                                            <span>Không có ngày đến hạn</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={props.deadline}
                                        onSelect={handleDeadlineSelect}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </>
                ) : null}
            </CardContent>
        </Card>
    );
}
