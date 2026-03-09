import { IContentReference } from '../types/note.type';

class NoteReferenceUtils {
    /**
     * Encode reference data to base64 string for HTML attribute
     */
    encodeReference(reference: IContentReference): string {
        try {
            return btoa(JSON.stringify(reference));
        } catch {
            return '';
        }
    }

    /**
     * Decode reference data from base64 string
     */
    decodeReference(encoded: string): IContentReference | null {
        try {
            if (!encoded) return null;
            return JSON.parse(atob(encoded));
        } catch {
            return null;
        }
    }

    /**
     * Get reference from HTML paragraph element
     */
    getReferenceFromElement(element: HTMLElement): IContentReference | null {
        const encodedRef = element.getAttribute('data-reference');
        return this.decodeReference(encodedRef || '');
    }

    /**
     * Format reference as human-readable text
     */
    formatReference(reference: IContentReference | null): string {
        if (!reference) return '';

        const parts: string[] = [];

        if (reference.type === 'youtube' || reference.type === 'media') {
            if (reference.timestamp != null) {
                const minutes = Math.floor(reference.timestamp / 60);
                const seconds = Math.floor(reference.timestamp % 60);
                parts.push(`⏱ ${minutes}:${seconds.toString().padStart(2, '0')}`);
            }
        }

        if (reference.type === 'file') {
            if (reference.page) {
                parts.push(`Page ${reference.page}`);
            }
        }

        if (reference.type === 'youtube') {
            parts.push('YouTube');
        } else if (reference.type === 'media') {
            parts.push('Media');
        } else if (reference.type === 'file') {
            parts.push('PDF');
        }

        return parts.join(' • ');
    }

    /**
     * Get the origin content URL for navigation
     */
    getOriginUrl(reference: IContentReference): string | null {
        if (reference.type === 'youtube' && reference.videoId && reference.timestamp) {
            return `https://www.youtube.com/watch?v=${reference.videoId}&t=${reference.timestamp}`;
        }

        return null;
    }
}

const noteReferenceUtilsInstance = new NoteReferenceUtils();

export default noteReferenceUtilsInstance;
