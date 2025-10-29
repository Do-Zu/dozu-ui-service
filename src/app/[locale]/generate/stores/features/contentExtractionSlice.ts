import axios from 'axios';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { EXTRACTION_TAB, ExtractionTab, ResourceContentType, RESOURCE_CONTENT_TYPE } from '../../constants/resource';
import { STATUS_CODE } from '@/utils/constants/http';

const BASE_API_YOUTUBE = '/api/youtube/transcript?videoId=';
const BASE_API_EXTRACT_WEBSITE = '/api/website-content';
interface IEmbedVideoInfo {
    iframe_url: string;
    flash_url: string;
    flash_secure_url: string;
    width: any;
    height: any;
}
export interface VideoInfo {
    title: string;
    thumbnailUrl: string;
    videoId: string;
    duration: number;
    embed: IEmbedVideoInfo;
}

export interface TranscriptSegment {
    text: string;
    startTime: number;
    duration: number;
}

export interface ContentExtractionState {
    inputUrl: string;
    extractedContent: string;
    isLoading: boolean;
    error: string | null;
    videoInfo: VideoInfo | null;
    contentType: ResourceContentType | null;
    activeTab: ExtractionTab;
    textContent: string;
    transcriptSegments: TranscriptSegment[];
}

const initialState: ContentExtractionState = {
    inputUrl: '',
    extractedContent: '',
    isLoading: false,
    error: null,
    videoInfo: null,
    contentType: null,
    activeTab: EXTRACTION_TAB.URL,
    textContent: '',
    transcriptSegments: [],
};

// Extract YouTube video ID from various YouTube URL formats
export const extractYouTubeVideoId = (url: string): string | null => {
    const patterns = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/i,
        /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/i,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/i,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^?]+)/i,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
};

// Async thunks for API calls
export const extractYouTubeTranscript = createAsyncThunk(
    'contentExtraction/extractYouTubeTranscript',
    async (videoId: string, { rejectWithValue }) => {
        try {
            const { data, status } = await axios.get(`${BASE_API_YOUTUBE}${videoId}`);

            if (status !== STATUS_CODE.OK) {
                throw new Error(data.error || 'Failed to fetch transcript');
            }

            const { transcript, transcriptSegments, metadata: rawMetadata } = data;
            const metadata = rawMetadata ?? {};

            return {
                transcript,
                transcriptSegments: transcriptSegments || [],
                metadata: {
                    ...metadata,
                    videoId,
                },
            };
        } catch (err: Error | any) {
            return rejectWithValue(
                err.message ||
                    'Failed to fetch transcript. This video might not have captions available or might be private.',
            );
        }
    },
);

export const extractWebsiteContent = createAsyncThunk(
    'contentExtraction/extractWebsiteContent',
    async (url: string, { rejectWithValue }) => {
        try {
            // Validate URL format
            let validUrl = url;
            if (!/^https?:\/\//i.test(url)) {
                validUrl = `https://${url}`;
            }

            const response = await axios.post(BASE_API_EXTRACT_WEBSITE, { url: validUrl });
            return response.data.content;
        } catch (err: any) {
            return rejectWithValue('Failed to extract content. Please check the URL and try again.');
        }
    },
);

// Create the slice
const contentExtractionSlice = createSlice({
    name: 'contentExtraction',
    initialState,
    reducers: {
        setInputUrl: (state, action: PayloadAction<string>) => {
            state.inputUrl = action.payload;
        },

        setActiveTab: (state, action: PayloadAction<ExtractionTab>) => {
            state.activeTab = action.payload;
        },
        setTextContent: (state, action: PayloadAction<string>) => {
            state.textContent = action.payload;
        },
        setExtractionContent: (state, action: PayloadAction<string>) => {
            state.extractedContent = action.payload;
        },
        resetExtractionState: (state) => {
            state.extractedContent = '';
            state.inputUrl = '';
            state.error = null;
            state.isLoading = false;
            state.activeTab = EXTRACTION_TAB.URL;
            state.videoInfo = null;
            state.contentType = null;
            state.textContent = '';
            state.transcriptSegments = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // YouTube transcript extraction
            .addCase(extractYouTubeTranscript.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(extractYouTubeTranscript.fulfilled, (state, action) => {
                state.isLoading = false;
                state.extractedContent = action.payload?.transcript;
                state.videoInfo = action.payload.metadata;
                state.contentType = RESOURCE_CONTENT_TYPE.YOUTUBE;
                // state.textContent = action.payload.transcript;
                state.transcriptSegments = action.payload.transcriptSegments || [];
            })
            .addCase(extractYouTubeTranscript.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Website content extraction
            .addCase(extractWebsiteContent.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(extractWebsiteContent.fulfilled, (state, action) => {
                state.isLoading = false;
                state.extractedContent = action.payload;
                state.contentType = RESOURCE_CONTENT_TYPE.WEBSITE;
                state.textContent = action.payload;
            })
            .addCase(extractWebsiteContent.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setInputUrl, setActiveTab, setTextContent, resetExtractionState, setExtractionContent } =
    contentExtractionSlice.actions;

export default contentExtractionSlice.reducer;
