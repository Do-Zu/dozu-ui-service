'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Circle, Triangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '@/lib/utils';

export interface DataStatusAction {
    /**
     * The label shown on the action button. Keep it short and clear.
     */
    label: string;
    /**
     * onClick is called when the button is pressed. Use this for actions
     * performed within the app, such as retrying a request. Do not provide
     * onClick if you supply href.
     */
    onClick?: () => void;
    /**
     * href navigates the user to another location. Use this for linking to
     * forms or pages where the user can remedy the issue. Do not provide
     * href if you supply onClick.
     */
    href?: string;
}

export interface DataStatusProps {
    /**
     * Controls the appearance of the component. When variant is "error" a
     * red theme is applied. When variant is "empty" a neutral grey theme
     * is applied.
     */
    variant: 'error' | 'empty';
    /**
     * The primary heading shown to users. If omitted, a sensible default is
     * chosen based on the variant.
     */
    title?: string;
    /**
     * Additional descriptive text explaining what happened and how the user
     * might recover. This prop is optional but recommended when there is
     * additional context to provide.
     */
    description?: string;
    /**
     * An optional call to action. Provide either an onClick or href to
     * indicate what the user should do next.
     */
    action?: DataStatusAction;
    /**
     * An optional icon to override the default icons. Pass any React node
     * (for example, an imported SVG). If omitted, a default icon based on
     * the variant is rendered.
     */
    icon?: React.ReactNode;
    /**
     * Custom styles  to apply to the outer container.
     */
    className?: string;
}
/**
 * DataStatus is a reusable component for displaying error or empty
 * results. It adheres to established guidelines for error and empty
 * constructive next steps to the user. The component
 * accepts optional props to customize its content and integrates
 * @param object
 * @returns ReactNode
 */
export default function DataStatus({ variant, title, description, action, icon, className = '' }: DataStatusProps) {
    // Default icons based on variant
    const defaultIcons: Record<'error' | 'empty', React.ReactNode> = {
        error: <Triangle className="size-10" aria-hidden="true" />,
        empty: <Circle className="size-10" aria-hidden="true" />,
    };

    // Button variant mapping using shadcn/ui
    const buttonVariant = variant === 'error' ? 'destructive' : ('default' as const);

    const renderAction = () => {
        if (!action) return null;
        if (action.href) {
            return (
                <Button variant={buttonVariant} asChild>
                    <Link href={action.href}>{action.label}</Link>
                </Button>
            );
        }
        return (
            <Button variant={buttonVariant} type="button" onClick={action.onClick}>
                {action.label}
            </Button>
        );
    };

    return (
        <Card
            className={cn(
                'mx-auto w-full max-w-md border-dashed',
                variant === 'error' ? 'border-destructive/40 bg-destructive/5' : 'border-muted/60 bg-muted/20',
                className,
            )}
        >
            <CardHeader className="items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className={cn(
                        'rounded-full p-3 ring-1',
                        variant === 'error'
                            ? 'bg-destructive/10 text-destructive ring-destructive/20'
                            : 'bg-accent/30 text-muted-foreground ring-border/50',
                    )}
                >
                    <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        {icon || defaultIcons[variant]}
                    </motion.div>
                </motion.div>

                <CardTitle
                    className={cn(
                        'mt-3 text-balance text-xl font-semibold',
                        variant === 'error' ? 'text-destructive' : '',
                    )}
                >
                    {title || (variant === 'error' ? 'Something went wrong' : 'No data found')}
                </CardTitle>
            </CardHeader>

            {description ? (
                <CardContent>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                        className="mx-auto max-w-prose text-center text-sm text-muted-foreground"
                    >
                        {description}
                    </motion.p>
                </CardContent>
            ) : null}

            {action ? (
                <CardContent className="flex justify-center pt-0">
                    <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        {renderAction()}
                    </motion.div>
                </CardContent>
            ) : null}
        </Card>
    );
}
