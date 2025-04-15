import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Types
interface VideoInfo {
  title: string;
  thumbnailUrl: string;
}

export interface ContentExtractionState {
  inputUrl: string;
  extractedContent: string;
  isLoading: boolean;
  error: string | null;
  contentView: 'preview' | 'markdown';
  videoInfo: VideoInfo | null;
  contentType: 'youtube' | 'website' | null;
  activeTab: string;
  textContent: string;
}

const initialState: ContentExtractionState = {
  inputUrl: '',
  extractedContent: '',
  isLoading: false,
  error: null,
  contentView: 'preview',
  videoInfo: null,
  contentType: null,
  activeTab: 'url',
  textContent: '',
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
      const { data, status } = await axios.get(`/api/youtube/transcript?videoId=${videoId}`);

      if (status !== 200) {
        throw new Error(data.error || 'Failed to fetch transcript');
      }

      return {
        transcript: data.transcript,
        metadata: {
          title: data.metadata.title,
          thumbnailUrl: data.metadata.thumbnailUrl,
        },
      };
    } catch (err: any) {
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

      const response = await axios.post('/api/website-content', { url: validUrl });
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
    setContentView: (state, action: PayloadAction<'preview' | 'markdown'>) => {
      state.contentView = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    setTextContent: (state, action: PayloadAction<string>) => {
      state.textContent = action.payload;
    },
    resetExtractionState: (state) => {
      state.extractedContent = '';
      state.error = null;
      state.videoInfo = null;
      state.contentType = null;
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
        state.extractedContent = action.payload.transcript;
        state.videoInfo = action.payload.metadata;
        state.contentType = 'youtube';
        state.textContent = action.payload.transcript;
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
        state.contentType = 'website';
        state.textContent = action.payload;
      })
      .addCase(extractWebsiteContent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setInputUrl, setContentView, setActiveTab, setTextContent, resetExtractionState } =
  contentExtractionSlice.actions;

export default contentExtractionSlice.reducer;
