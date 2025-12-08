import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Format date to relative time (e.g., "2 giờ trước")
 */
export const formatRelativeTime = (date: string | Date): string => {
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return formatDistanceToNow(dateObj, { addSuffix: true, locale: vi });
    } catch {
        return 'Vừa xong';
    }
};

/**
 * Get user initials from name or username
 */
export const getInitials = (name: string | null, username: string): string => {
    if (name && name.trim()) {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    }
    if (username && username.trim()) {
        return username.substring(0, 2).toUpperCase();
    }
    return 'U';
};
