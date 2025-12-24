import { cva } from 'class-variance-authority';

export const dayEventVariants = cva('rounded border-l-4 p-2 text-xs font-bold', {
    variants: {
        variant: {
            default: 'border-muted bg-muted/30 text-muted-foreground',
            blue: 'border-blue-500 bg-blue-500/30 text-blue-600',
            green: 'border-green-500 bg-green-500/30 text-green-600',
            pink: 'border-pink-500 bg-pink-500/30 text-pink-600',
            purple: 'border-purple-500 bg-purple-500/30 text-purple-600',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});

export const HEIGHT_OF_EACH_SESSION_HOUR_PX = 60;
export const HEIGHT_OF_EACH_SESSION_HOUR = `${HEIGHT_OF_EACH_SESSION_HOUR_PX}px`;
export const MIN_EVENT_HEIGHT = 10;
