import { cn } from '@/lib/utils';

interface ActiveDotProps {
    isActive?: boolean;
}

export function ActiveDot({ isActive = false }: ActiveDotProps) {
    return (
        <span
            className={cn(
                'inline-block w-2 h-2 rounded-full transition-colors',
                isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300',
            )}
        />
    );
}
