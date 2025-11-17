import { Badge } from '@/components/ui/badge';

export function AvailabilityBadge({ isAvailable }: { isAvailable: boolean }) {
    return (
        <Badge 
            className={isAvailable 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }
        >
            {isAvailable ? 'Available' : 'Unavailable'}
        </Badge>
    );
}

export function DefaultBadge({ isDefault }: { isDefault: boolean }) {
    if (!isDefault) return null;
    return (
        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            Default
        </Badge>
    );
}

