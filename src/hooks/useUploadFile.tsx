import Axios from '@/api/axios';
import { useCallback, useState } from 'react';

interface UseFileUploadOptions {
    url: string;
    method?: 'post' | 'put';
    /** Extra form fields to send along with the file */
    additionalFields?: Record<string, string | Blob>;
}

interface UploadState<T = ArrayBuffer> {
    data: T | null;
    loading: boolean;
    error: unknown;
}

interface UploadResult<T = ArrayBuffer> extends UploadState<T> {
    upload: (file: File | Blob, extraFields?: Record<string, string | Blob>) => Promise<T | null>;
    reset: () => void;
}

/**
 * Hook for uploading a file as FormData and receiving an arraybuffer response.
 *
 */
export function useFileUpload<T = ArrayBuffer>(options: UseFileUploadOptions): UploadResult<T> {
    const { url, method = 'post', additionalFields } = options;

    const [state, setState] = useState<UploadState<T>>({
        data: null,
        loading: false,
        error: null,
    });

    const upload = useCallback(
        async (file: File | Blob, extraFields?: Record<string, string | Blob>): Promise<T | null> => {
            setState((prev) => ({ ...prev, loading: true, error: null }));

            try {
                const formData = new FormData();

                formData.append('file', file);

                // Add default / configured extra fields
                if (additionalFields) {
                    Object.entries(additionalFields).forEach(([key, value]) => {
                        formData.append(key, value);
                    });
                }

                // Add call-time extra fields
                if (extraFields) {
                    Object.entries(extraFields).forEach(([key, value]) => {
                        formData.append(key, value);
                    });
                }

                const response = await Axios.request<T>({
                    url,
                    method,
                    data: formData,
                    responseType: 'arraybuffer',
                    // Let browser set the correct multipart boundary
                    headers: {
                        // Explicitly unset to avoid overriding FormData behavior
                        'Content-Type': undefined as unknown as string,
                    },
                });

                const data = response.data;
                setState({ data, loading: false, error: null });
                return data;
            } catch (error) {
                setState({ data: null, loading: false, error });
                return null;
            }
        },
        [url, method, additionalFields],
    );

    const reset = useCallback(() => {
        setState({ data: null, loading: false, error: null });
    }, []);

    return { ...state, upload, reset };
}
