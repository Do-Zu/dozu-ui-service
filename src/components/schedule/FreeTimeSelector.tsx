'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { IFreeTime, ITimeSlot } from '@/services/schedule/schedule.types';
import clsx from 'clsx';
import { Calendar, Info, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const dayMapping = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const hours = Array.from({ length: 24 }, (_, i) => i);

interface Props {
    initialData?: IFreeTime;
    onChange?: (freeTime: IFreeTime) => void;
}

export default function FreeTimeSelector({ initialData, onChange }: Props) {
    const [freeTime, setFreeTime] = useState<boolean[][]>(Array.from({ length: 7 }, () => Array(24).fill(false)));
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<{ day: number; hour: number } | null>(null);
    const [dragMode, setDragMode] = useState<'select' | 'deselect'>('select');
    const tableRef = useRef<HTMLTableElement>(null);

    // Convert time slots to boolean array
    const convertTimeSlotsToBoolean = (timeSlots: ITimeSlot[]): boolean[] => {
        const result = Array(24).fill(false);
        timeSlots.forEach((slot) => {
            const startHour = parseInt(slot.startTime.split(':')[0]);
            const endHour = parseInt(slot.endTime.split(':')[0]);
            const startMinute = parseInt(slot.startTime.split(':')[1]);
            const endMinute = parseInt(slot.endTime.split(':')[1]);

            for (let hour = startHour; hour <= endHour; hour++) {
                if (hour === startHour && startMinute > 0) continue;
                if (hour === endHour && endMinute === 0) break;
                result[hour] = true;
            }
        });
        return result;
    };

    // Convert boolean array to time slots
    const convertBooleanToTimeSlots = (booleanArray: boolean[]): ITimeSlot[] => {
        const timeSlots: ITimeSlot[] = [];
        let startHour = -1;

        for (let hour = 0; hour < 24; hour++) {
            if (booleanArray[hour] && startHour === -1) {
                startHour = hour;
            } else if (!booleanArray[hour] && startHour !== -1) {
                timeSlots.push({
                    startTime: `${startHour.toString().padStart(2, '0')}:00`,
                    endTime: `${hour.toString().padStart(2, '0')}:00`,
                });
                startHour = -1;
            }
        }

        // Handle case where day ends with selected time
        if (startHour !== -1) {
            timeSlots.push({
                startTime: `${startHour.toString().padStart(2, '0')}:00`,
                endTime: '24:00',
            });
        }

        return timeSlots;
    };

    // Initialize from API data
    useEffect(() => {
        if (initialData) {
            const newFreeTime = Array.from({ length: 7 }, (_, dayIndex) => {
                const dayName = dayMapping[dayIndex] as keyof IFreeTime;
                const dayTimeSlots = initialData[dayName] || [];
                return convertTimeSlotsToBoolean(dayTimeSlots);
            });
            setFreeTime(newFreeTime);
        }
    }, [initialData]);

    const toggleTime = (dayIndex: number, hour: number) => {
        const newTime = [...freeTime];
        newTime[dayIndex][hour] = !newTime[dayIndex][hour];
        setFreeTime(newTime);
        updateParent(newTime);
    };

    const updateParent = useCallback(
        (newTime: boolean[][]) => {
            if (onChange) {
                const apiFormat: IFreeTime = {};
                newTime.forEach((daySchedule, index) => {
                    const dayName = dayMapping[index] as keyof IFreeTime;
                    const timeSlots = convertBooleanToTimeSlots(daySchedule);
                    if (timeSlots.length > 0) {
                        apiFormat[dayName] = timeSlots;
                    }
                });
                onChange(apiFormat);
            }
        },
        [onChange],
    );

    const handleMouseDown = (dayIndex: number, hour: number) => {
        setIsDragging(true);
        setDragStart({ day: dayIndex, hour });
        setDragMode(freeTime[dayIndex][hour] ? 'deselect' : 'select');
        toggleTime(dayIndex, hour);
    };

    const handleMouseEnter = (dayIndex: number, hour: number) => {
        if (isDragging && dragStart) {
            const newTime = [...freeTime];

            // Calculate the range to select/deselect
            const startDay = Math.min(dragStart.day, dayIndex);
            const endDay = Math.max(dragStart.day, dayIndex);
            const startHour = Math.min(dragStart.hour, hour);
            const endHour = Math.max(dragStart.hour, hour);

            // Apply selection/deselection to the range
            for (let d = startDay; d <= endDay; d++) {
                for (let h = startHour; h <= endHour; h++) {
                    newTime[d][h] = dragMode === 'select';
                }
            }

            setFreeTime(newTime);
            updateParent(newTime);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setDragStart(null);
    };

    const clearAllTimes = () => {
        const newTime = Array.from({ length: 7 }, () => Array(24).fill(false));
        setFreeTime(newTime);
        updateParent(newTime);
    };

    const resetToInitial = () => {
        if (initialData) {
            const newFreeTime = Array.from({ length: 7 }, (_, dayIndex) => {
                const dayName = dayMapping[dayIndex] as keyof IFreeTime;
                const dayTimeSlots = initialData[dayName] || [];
                return convertTimeSlotsToBoolean(dayTimeSlots);
            });
            setFreeTime(newFreeTime);
            updateParent(newFreeTime);
        }
    };

    const getSelectedHoursCount = () => {
        return freeTime.reduce((total, day) => total + day.reduce((dayTotal, hour) => dayTotal + (hour ? 1 : 0), 0), 0);
    };

    const formatHour = (hour: number) => {
        return `${hour.toString().padStart(2, '0')}:00`;
    };

    // Prevent text selection during drag
    useEffect(() => {
        const handleSelectStart = (e: Event) => {
            if (isDragging) e.preventDefault();
        };

        document.addEventListener('selectstart', handleSelectStart);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('selectstart', handleSelectStart);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    return (
        <TooltipProvider>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            Chọn thời gian rảnh trong tuần
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearAllTimes}
                                        className="flex items-center gap-1"
                                    >
                                        <Info className="h-3 w-3" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <div className="text-sm ">
                                        <p className="font-medium mb-1">Hướng dẫn sử dụng:</p>
                                        <ul className="space-y-1 text-xs">
                                            <li>
                                                • <strong>Click</strong> vào ô để chọn/bỏ chọn 1 giờ
                                            </li>
                                            <li>
                                                • <strong>Kéo thả</strong> để chọn nhiều giờ cùng lúc
                                            </li>
                                            <li>• Màu xanh lá: Thời gian rảnh đã chọn</li>
                                            <li>• Màu trắng: Thời gian chưa chọn</li>
                                        </ul>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                            {initialData && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={resetToInitial}
                                            className="flex items-center gap-1"
                                        >
                                            <RotateCcw className="h-3 w-3" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Khôi phục về cài đặt ban đầu</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Instructions */}

                        {/* Time Selection Table */}
                        <div className="overflow-auto border rounded-lg shadow-sm">
                            <table
                                ref={tableRef}
                                className="min-w-full border-collapse text-sm select-none"
                                onMouseLeave={handleMouseUp}
                            >
                                <thead>
                                    <tr>
                                        <th className="border border-gray-200 p-3 text-left font-semibold sticky left-0 bg-white z-10">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 " />
                                                Ngày / Giờ
                                            </div>
                                        </th>
                                        {hours.map((hour) => (
                                            <th
                                                key={hour}
                                                className="border border-gray-200 p-2 text-center font-medium min-w-[40px]"
                                            >
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="cursor-help">
                                                            <span className="text-xs font-bold">{hour}</span>
                                                            <span className="text-[10px]">:00</span>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>
                                                            {formatHour(hour)} - {formatHour(hour + 1)}
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {days.map((day, dayIndex) => (
                                        <tr key={day} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="border border-gray-200 p-3 font-semibold  sticky left-0 z-10">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-primary/20"></div>
                                                    {day}
                                                </div>
                                            </td>
                                            {hours.map((hour) => (
                                                <td
                                                    key={hour}
                                                    className={clsx(
                                                        'border border-gray-200 p-0 cursor-pointer transition-all duration-150 hover:scale-110',
                                                        'relative group min-w-[40px] h-10',
                                                        freeTime[dayIndex][hour]
                                                            ? 'bg-gradient-to-br from-green-400 to-green-500 shadow-sm'
                                                            : 'bg-white hover:bg-gray-100',
                                                        isDragging && 'select-none',
                                                    )}
                                                    onMouseDown={() => handleMouseDown(dayIndex, hour)}
                                                    onMouseEnter={() => handleMouseEnter(dayIndex, hour)}
                                                >
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                {freeTime[dayIndex][hour] && (
                                                                    <div className="w-2 h-2 bg-white rounded-full shadow-sm opacity-80"></div>
                                                                )}
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>
                                                                <strong>{day}</strong> - {formatHour(hour)} đến{' '}
                                                                {formatHour(hour + 1)}
                                                            </p>
                                                            <p className="text-xs text-gray-300">
                                                                {freeTime[dayIndex][hour]
                                                                    ? 'Đã chọn - Click để bỏ chọn'
                                                                    : 'Click để chọn'}
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TooltipProvider>
    );
}
