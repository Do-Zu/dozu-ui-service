import React from 'react';
import { ITopic } from '../../types/topic.type';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
import Image from 'next/image';

interface Props {
    topic: ITopic;
    handleNameClick: (topic: ITopic) => void;
    menuContent: (topic: ITopic) => React.ReactNode;
    footer: (topic: ITopic) => React.ReactNode;
}

export default function TopicCard({ topic, handleNameClick, menuContent, footer }: Props) {
    const { imageUrl } = topic;
    return (
        <Card className="overflow-hidden transition-all duration-200 hover:shadow-md hover:cursor-pointer bg-gray-50 dark:bg-gray-600">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle
                        className="text-lg font-medium truncate hover:underline hover:text-blue-400 transition"
                        onClick={() => handleNameClick(topic)}
                    >
                        {topic.name}
                    </CardTitle>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:pointer-events-auto">
                                <MoreVertical className="h-4 w-4 text-gray-500" />
                            </Button>
                        </DropdownMenuTrigger>
                        {menuContent(topic)}
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
                {footer(topic)}
            </CardContent>
        </Card>
    );
}
