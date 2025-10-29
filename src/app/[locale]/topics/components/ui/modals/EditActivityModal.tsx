'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, BookOpen, Target, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { ITopic } from '@/app/[locale]/topics/types/topic.type';
import { IActivity } from '@/types/activity';

interface EditActivityModalProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    onSubmit: (data: EditActivityData) => void;
    activity: IActivity | null;
    classId: number;
}

export interface EditActivityData {
    id: string;
    title: string;
    description: string;
    topicId: number;
    quizType: 'multiple-choice' | 'flashcard' | 'quiz' | 'learning';
    dueDate: Date;
    settings: {
        timeLimit?: number;
        attempts?: number;
        shuffleQuestions?: boolean;
        showCorrectAnswers?: boolean;
    };
}

export default function EditActivityModal({ 
    isOpen, 
    setIsOpen, 
    onSubmit, 
    activity,
    classId 
}: EditActivityModalProps) {
    const t = useTranslations('activity');
    const tCommon = useTranslations('common');
    
    const [topics, setTopics] = useState<ITopic[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<EditActivityData>({
        id: '',
        title: '',
        description: '',
        topicId: 0,
        quizType: 'multiple-choice',
        dueDate: new Date(),
        settings: {
            timeLimit: 30,
            attempts: 3,
            shuffleQuestions: true,
            showCorrectAnswers: true
        }
    });

    // Initialize form data when activity changes
    useEffect(() => {
        if (activity && isOpen) {
            setFormData({
                id: activity.id,
                title: activity.title,
                description: activity.description,
                topicId: activity.topicId,
                quizType: activity.quizType,
                dueDate: new Date(activity.dueDate),
                settings: {
                    timeLimit: 30,
                    attempts: 3,
                    shuffleQuestions: true,
                    showCorrectAnswers: true
                }
            });
            fetchTopics();
        }
    }, [activity, isOpen]);

    const fetchTopics = async () => {
        try {
            setLoading(true);
            // TODO: Replace with actual API call
            const mockTopics: ITopic[] = [
                { 
                    topicId: 1, 
                    name: 'English Vocabulary', 
                    description: 'Từ vựng tiếng Anh cơ bản',
                    userId: 1,
                    createdAt: new Date()
                },
                { 
                    topicId: 2, 
                    name: 'Science Terms', 
                    description: 'Thuật ngữ khoa học',
                    userId: 1,
                    createdAt: new Date()
                },
                { 
                    topicId: 3, 
                    name: 'Math Concepts', 
                    description: 'Khái niệm toán học',
                    userId: 1,
                    createdAt: new Date()
                }
            ];
            setTopics(mockTopics);
        } catch (error) {
            console.error('Error fetching topics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.description || formData.topicId === 0) {
            return;
        }
        onSubmit(formData);
    };

    const handleInputChange = (field: keyof EditActivityData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSettingsChange = (field: keyof EditActivityData['settings'], value: any) => {
        setFormData(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                [field]: value
            }
        }));
    };

    if (!isOpen || !activity) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    setIsOpen(false);
                }
            }}
        >
            <div className="w-full max-w-2xl max-h-[85vh] bg-white rounded-xl shadow-2xl flex flex-col animate-in fade-in-0 zoom-in-95 duration-300">
                <div className="flex items-center justify-between p-6 border-b bg-gray-50/80 backdrop-blur-sm rounded-t-xl">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900">
                        <Target className="h-5 w-5 text-blue-600" />
                        Chỉnh sửa hoạt động
                    </h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsOpen(false)}
                        className="h-8 w-8 p-0 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <span className="text-lg font-medium">×</span>
                    </Button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 bg-white">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="title">Tiêu đề hoạt động *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    placeholder="Nhập tiêu đề hoạt động..."
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Mô tả</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Mô tả chi tiết về hoạt động..."
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="topic">Chủ đề *</Label>
                                <Select 
                                    value={formData.topicId.toString()} 
                                    onValueChange={(value) => handleInputChange('topicId', parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn chủ đề..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {topics.map((topic) => (
                                            <SelectItem key={topic.topicId} value={topic.topicId.toString()}>
                                                {topic.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="quizType">Loại hoạt động *</Label>
                                <Select 
                                    value={formData.quizType} 
                                    onValueChange={(value: EditActivityData['quizType']) => handleInputChange('quizType', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn loại hoạt động..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="multiple-choice">Trắc nghiệm</SelectItem>
                                        <SelectItem value="quiz">Bài kiểm tra</SelectItem>
                                        <SelectItem value="flashcard">Flashcard</SelectItem>
                                        <SelectItem value="learning">Học tập</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Ngày hết hạn *</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !formData.dueDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.dueDate ? format(formData.dueDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={formData.dueDate}
                                            onSelect={(date) => date && handleInputChange('dueDate', date)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Advanced Settings */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Cài đặt nâng cao
                            </h4>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="timeLimit">Thời gian (phút)</Label>
                                    <Input
                                        id="timeLimit"
                                        type="number"
                                        value={formData.settings.timeLimit}
                                        onChange={(e) => handleSettingsChange('timeLimit', parseInt(e.target.value) || 0)}
                                        min="1"
                                        max="180"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="attempts">Số lần thử</Label>
                                    <Input
                                        id="attempts"
                                        type="number"
                                        value={formData.settings.attempts}
                                        onChange={(e) => handleSettingsChange('attempts', parseInt(e.target.value) || 1)}
                                        min="1"
                                        max="10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="shuffleQuestions"
                                        checked={formData.settings.shuffleQuestions}
                                        onChange={(e) => handleSettingsChange('shuffleQuestions', e.target.checked)}
                                        className="rounded"
                                    />
                                    <Label htmlFor="shuffleQuestions" className="text-sm">
                                        Xáo trộn câu hỏi
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="showCorrectAnswers"
                                        checked={formData.settings.showCorrectAnswers}
                                        onChange={(e) => handleSettingsChange('showCorrectAnswers', e.target.checked)}
                                        className="rounded"
                                    />
                                    <Label htmlFor="showCorrectAnswers" className="text-sm">
                                        Hiển thị đáp án đúng
                                    </Label>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 bg-gray-50/80 backdrop-blur-sm -mx-6 -mb-6 px-6 pb-6 rounded-b-xl">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setIsOpen(false)}
                                className="px-6 hover:bg-gray-100 transition-colors"
                            >
                                Hủy
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={loading || !formData.title || formData.topicId === 0}
                                className="bg-blue-600 hover:bg-blue-700 px-6 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Đang cập nhật...' : 'Cập nhật hoạt động'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
