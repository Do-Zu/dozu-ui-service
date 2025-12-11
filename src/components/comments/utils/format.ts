import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

/**
 * Format date to relative time (e.g., "2 giờ trước" or "2 hours ago")
 * @param date - The date to format
 * @param locale - The locale string ('vi' or 'en')
 */
export const formatRelativeTime = (date: string | Date, locale: string = 'vi'): string => {
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const dateFnsLocale = locale === 'vi' ? vi : enUS;
        return formatDistanceToNow(dateObj, { addSuffix: true, locale: dateFnsLocale });
    } catch {
        return locale === 'vi' ? 'Vừa xong' : 'Just now';
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
