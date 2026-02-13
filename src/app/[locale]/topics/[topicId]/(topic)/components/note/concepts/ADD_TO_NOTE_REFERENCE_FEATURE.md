# Add to Note with Reference Feature

## Overview

This feature allows users to add selected text from learning materials (YouTube videos, PDFs, audio, and video files) to their notes while preserving a reference to the source content. When a user hovers over or clicks on referenced text in their notes, they can:

1. **See the reference information** - A tooltip shows where the content came from
2. **Navigate to the source** - Clicking on YouTube references will seek to the specific timestamp
3. **Get context** - For PDFs, the page number is stored; for videos/YouTube, the timestamp is saved

## Architecture

### Type Definitions (`types/note.type.ts`)

- **`ContentReferenceType`** - Union type supporting: `'youtube'`, `'pdf'`, `'audio'`, `'video'`
- **`IContentReference`** - Interface containing reference metadata:
    - `type`: The type of content
    - `timestamp?`: Video/audio/YouTube timestamp in seconds
    - `page?`: PDF page number
    - `videoId?`: YouTube video ID for external links

### Core Components & Files

#### 1. **Context Extensions** (`context/TopicWorkspaceContext.tsx`)

- **`getContentReference()`** - Extracts current position based on material type:
    - YouTube: Gets player time and video ID
    - PDF: Gets current page number
    - Audio/Video: Gets current playback time
- **`getCurrentPosition()`** - Returns current timestamp or page number

#### 2. **Media Player Adapters**

All adapters now implement `getCurrentTime()` method:

- `YouTubePlayerAdapter` - Returns current video time
- `VideoPlayerAdapter` - Returns HTML5 video current time
- `AudioPlayerAdapter` - Returns audio element current time

#### 3. **Input Handler** (`hooks/useSelectMenu.tsx`)

When user clicks "Add to note":

```tsx
1. Get selected text
2. Call getContentReference() to capture metadata
3. Encode reference as base64 in data attribute
4. Create HTML: <p data-reference="[encoded]" class="note-segment">[text]</p>
5. Save to backend
```

#### 4. **Editor Integration** (`components/note/RichTextEditor.tsx`)

- Uses custom `ParagraphWithReference` extension
- Preserves `data-reference` attributes during editing
- Maintains HTML structure for tooltips

#### 5. **Display & Interaction** (`hooks/useNoteReferences.ts`)

Automatic enhancement of note content:

- Adds CSS styling for reference highlights
- Attaches click handlers to elements with `data-reference`
- Shows formatted tooltip with reference info
- Navigates YouTube videos to stored timestamp

#### 6. **Utility Functions** (`utils/note-reference.utils.ts`)

Helper methods:

- `encodeReference()` - Converts reference to base64
- `decodeReference()` - Converts base64 back to reference object
- `formatReference()` - Creates readable reference text (e.g., "2:34 • Page 5")
- `getOriginUrl()` - Generates shareable YouTube link with timestamp

## Usage Flow

### Step 1: User Selects Text

User highlights text in any learning material (YouTube transcript, PDF, etc.)

### Step 2: Capture Reference

`SelectMenu` component captures:

- Selected text
- Current position (timestamp for video/YouTube, page for PDF)
- Material type and metadata (video ID, etc.)

### Step 3: Save with Reference

Text is saved to notes HTML with encoded reference data:

```html
<p
    data-reference="eyJ0eXBlIjoieW91dHViZSIsInRpbWVzdGFtcCI6MzQ1LCJ2aWRlb0lkIjoiZFh3ZjdjVzRmUlEifQ=="
    class="note-segment"
>
    Selected text here
</p>
```

### Step 4: Display with Tooltips

When note is displayed:

- Reference hook adds event listeners
- Hovering shows tooltip with source info
- Clicking navigates to source (YouTube seeks to timestamp)

## Data Storage

Reference data is stored as base64-encoded JSON in HTML attributes:

```json
{
    "type": "youtube",
    "timestamp": 345,
    "videoId": "dXwf7cW4fRQ"
}
```

Base64 encoded: `eyJ0eXBlIjoieW91dHViZSIsInRpbWVzdGFtcCI6MzQ1LCJ2aWRlb0lkIjoiZFh3ZjdjVzRmUlEifQ==`

## Styling

Reference segments are automatically styled with:

- Hover highlight (yellow background)
- Pin icon (📌) appears on hover
- Pointer cursor to indicate interactivity
- Optional title attribute for basic tooltip

CSS is injected via `useNoteReferences` hook:

```css
[data-reference] {
    background-color: rgba(234, 179, 8, 0.3);
    cursor: pointer;
}

[data-reference]::after {
    content: '📌';
    opacity: 0;
    transition: opacity 0.2s ease;
}

[data-reference]:hover::after {
    opacity: 1;
}
```

## Features by Material Type

### YouTube Videos

- ✅ Captures timestamp (seconds)
- ✅ Stores video ID
- ✅ Click navigates to timestamp
- ✅ Tooltip shows: "MM:SS • YouTube"

### PDF Files

- ✅ Captures page number
- ✅ Tooltip shows: "Page N"
- ✅ Click awareness for future page navigation

### Audio Files

- ✅ Captures timestamp
- ✅ Tooltip shows: "MM:SS"
- ✅ Click seeks to timestamp

### Video Files (Local Upload)

- ✅ Captures timestamp
- ✅ Tooltip shows: "MM:SS"
- ✅ Click seeks to timestamp

## Browser Compatibility

- Uses `btoa()`/`atob()` for base64 encoding (IE 10+, all modern browsers)
- Requires `MutationObserver` for dynamic content watching (IE 11+, all modern browsers)
- All media player APIs are standard HTML5/YouTube API

## Future Enhancements

1. **Clickable PDF Pages** - Navigate to page number in PDF viewer
2. **Reference Analytics** - Track which notes are referencing which content
3. **Batch Operations** - Remove all references for deleted content
4. **Export** - Include references when exporting notes
5. **Visual Indicators** - Different icons for different content types
6. **Tooltip Customization** - User preferences for reference display

## Troubleshooting

### References Not Showing

1. Check browser console for errors
2. Verify `useNoteReferences` hook is called in NoteTab
3. Ensure `data-reference` attributes are preserved in HTML

### Click Navigation Not Working

1. Verify media player controller has `getCurrentTime()` method
2. Check if `seekTo()` is properly connected to media player
3. Ensure material is still loaded (not switched to different content)

### Encoded Data Corruption

1. Check for HTML escaping issues - use `dangerouslySetInnerHTML` carefully
2. Verify base64 encoding/decoding in `note-reference.utils`
3. Ensure attributes aren't being sanitized by HTML parser

## Code Examples

### Adding Text with Reference

```typescript
// In useSelectMenu.tsx
const onAddToNoteClick = useCallback(async () => {
    const reference = getContentReference(); // Gets current position
    const cleanedContent = getCleanedContent(); // Gets selected text

    const htmlContent = `<p data-reference="${
        reference ? btoa(JSON.stringify(reference)) : ''
    }" class="note-segment">${cleanedContent}</p>`;

    const content = (note?.content || '').concat('<p></p>' + htmlContent);
    await updateNoteAsync({ topicId, content });
}, [note, getCleanedContent, updateNoteAsync, topicId, getContentReference]);
```

### Decoding and Using Reference

```typescript
// In note-reference.utils.ts
decodeReference(encoded: string): IContentReference | null {
    try {
        if (!encoded) return null;
        return JSON.parse(atob(encoded));
    } catch {
        return null;
    }
}

// In useNoteReferences.ts hook
const reference = noteReferenceUtils.decodeReference(encodedRef);
if (reference?.type === 'youtube' && reference?.timestamp) {
    seekTo(reference.timestamp); // Navigate to timestamp
}
```

## Files Modified/Created

### New Files

- `types/note.type.ts` - Extended with reference types
- `utils/note-reference.utils.ts` - Utility functions
- `components/note/ParagraphWithReference.ts` - Custom Tiptap extension
- `components/note/NoteSegmentRenderer.tsx` - Rich reference display component
- `hooks/useNoteReferences.ts` - Reference interaction hook

### Modified Files

- `context/TopicWorkspaceContext.tsx` - Added reference tracking
- `media/core/MediaPlayerController.ts` - Added getCurrentTime() method
- `media/core/youtube/YoutubePlayerAdapter.ts` - Implemented getCurrentTime()
- `media/core/video/VideoPlayerAdapter.ts` - Implemented getCurrentTime()
- `media/core/audio/AudioPlayerAdapter.ts` - Implemented getCurrentTime()
- `hooks/media/useMediaPlayer.tsx` - Exposed controllerRef
- `hooks/useSelectMenu.tsx` - Updated to capture references
- `components/tabs/NoteTab.tsx` - Added useNoteReferences hook
- `components/note/RichTextEditor.tsx` - Integrated custom paragraph extension
