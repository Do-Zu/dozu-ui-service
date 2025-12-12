import React from 'react';
import Image from 'next/image';
import { MoreVertical, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ITopic } from '../../types/topic.type';

interface Props {
    topic: ITopic;
    handleNameClick: (topic: ITopic) => void;
    menuContent: (topic: ITopic) => React.ReactNode | null;
    footer: (topic: ITopic) => React.ReactNode | null;
}

export default function TopicCard({ topic, handleNameClick, menuContent, footer }: Props) {
    const { name, imageUrl, description } = topic;

    return (
        <Card
            className="group relative flex flex-col h-full border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:border-zinc-400 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 cursor-pointer overflow-hidden rounded-xl hover:-translate-y-1"
            onClick={() => handleNameClick(topic)}
        >
            <div className="relative aspect-[3/2] w-full overflow-hidden bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
                {imageUrl ? (
                    <Image
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        alt={name}
                        src={imageUrl}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <div
                            className="h-12 w-12 rounded-full flex items-center justify-center 
                                bg-zinc-200 dark:bg-zinc-800 
                                dark:border dark:border-zinc-700
                                border border-zinc-300/80"
                        >
                            <Package className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
                        </div>
                    </div>
                )}

                <div
                    role="presentation"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                >
                    {(() => {
                        const menu = menuContent(topic);
                        return menu ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="h-8 w-8 rounded-full bg-white/90 shadow-sm backdrop-blur-sm hover:bg-white text-zinc-900 dark:bg-zinc-800/90 dark:hover:bg-zinc-700 dark:text-zinc-100"
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                {menu}
                            </DropdownMenu>
                        ) : null;
                    })()}
                </div>
            </div>

            <CardHeader className="flex-none px-5 pt-5 pb-0">
                <CardTitle className="text-lg font-bold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50">
                    <span className="line-clamp-1">{name}</span>
                </CardTitle>
                {description && (
                    <p className="mt-2 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400 font-normal">
                        {description}
                    </p>
                )}
            </CardHeader>

            <CardContent className="flex-grow flex flex-col justify-end px-5 pb-5 pt-4">{footer(topic)}</CardContent>
        </Card>
    );
}
