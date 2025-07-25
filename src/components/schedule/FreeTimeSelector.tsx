'use client';

import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { IFreeTime, ITimeSlot } from '@/services/schedule/schedule.types';

const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const dayMapping = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const hours = Array.from({ length: 24 }, (_, i) => i);

interface Props {
    initialData?: IFreeTime;
    onChange?: (freeTime: IFreeTime) => void;
}

export default function FreeTimeSelector({ initialData, onChange }: Props) {
    const [freeTime, setFreeTime] = useState<boolean[][]>(Array.from({ length: 7 }, () => Array(24).fill(false)));

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

        // Convert back to API format and call onChange
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
    };

    return (
        <div className="overflow-auto border rounded">
            <table className="min-w-full border-collapse text-sm">
                <thead>
                    <tr>
                        <th className="border p-2 bg-gray-100 text-left">Ngày - Giờ</th>
                        {hours.map((hour) => (
                            <th key={hour} className="border p-1 text-center">
                                {hour}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {days.map((day, dayIndex) => (
                        <tr key={day}>
                            <td className="border p-2 font-medium">{day}</td>
                            {hours.map((hour) => (
                                <td
                                    key={hour}
                                    className={clsx(
                                        'border p-1 cursor-pointer',
                                        freeTime[dayIndex][hour] ? 'bg-green-400' : 'bg-white',
                                    )}
                                    onClick={() => toggleTime(dayIndex, hour)}
                                />
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
