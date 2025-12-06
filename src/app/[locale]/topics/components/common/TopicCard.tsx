import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ITopic } from '../../types/topic.type';
import { BackgroundGradientCard } from '@/components/common/BackgroundGradientCard';

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
            className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-primary/50 cursor-pointer bg-card border border-border shadow-md rounded-xl"
            onClick={() => handleNameClick(topic)}
        >
            <BackgroundGradientCard />

            <div className="relative z-10">
                <CardHeader className="pb-2 px-5 pt-5">
                    <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-semibold truncate text-foreground">
                                <div className="group/title relative cursor-pointer truncate font-semibold transition-all duration-300 inline-block w-full">
                                    <span className="opacity-100 group-hover/title:opacity-0 transition-opacity duration-300">
                                        {name}
                                    </span>
                                    <span className="absolute inset-0 opacity-0 group-hover/title:opacity-100 bg-gradient-to-r from-primary via-primary to-primary/95 bg-clip-text text-transparent truncate transition-opacity duration-300">
                                        {name}
                                    </span>
                                </div>
                            </CardTitle>

                            {description && (
                                <p className="mt-1 text-xs text-muted-foreground line-clamp-2 font-normal">
                                    {description}
                                </p>
                            )}
                        </div>

                        {menuContent(topic) ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-muted rounded-lg flex-shrink-0 -mr-2"
                                    >
                                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                {menuContent(topic)}
                            </DropdownMenu>
                        ) : null}
                    </div>
                </CardHeader>

                <CardContent className="px-5 pb-5">
                    <div
                        className={`relative h-40 w-full rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-border/50 ${
                            !imageUrl ? 'bg-muted/50' : ''
                        }`}
                    >
                        {imageUrl ? (
                            <Image
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                alt={name}
                                src={imageUrl}
                            />
                        ) : (
                            <div className="text-muted-foreground text-xs font-medium">• No Preview •</div>
                        )}
                    </div>

                    <div className="flex flex-col text-xs text-muted-foreground">{footer(topic)}</div>
                </CardContent>
            </div>
        </Card>
    );
}
