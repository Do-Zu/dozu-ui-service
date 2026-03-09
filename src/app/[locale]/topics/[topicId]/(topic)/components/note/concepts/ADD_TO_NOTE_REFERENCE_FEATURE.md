# Add to Note with Reference Feature

## Changelog

### 2026-03-07 — Fix: transcript text selections always saved timestamp 00:00

**Problem:** Every note entry created from a YouTube transcript was saved with `timestamp: 0`.

**Root cause:** `getContentReference()` read the current player time via
`controllerRef.current?.getCurrentTime()`. Because `YoutubeLearningMaterial` calls
`player.pauseVideo()` in `onReady`, the player is paused at `0:00` unless the user actively
plays the video. Transcript segments are readable without playing, so the captured time was
always `0`.

**Solution:** Capture the segment's `startTime` from the DOM at selection time and prefer it
over the live player position.

**Files changed:**

| File                                                         | Change                                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/material/common/transcript/TranscriptViewer.tsx` | Added `data-start-time={segment.startTime}` attribute to every transcript row `<div>`                                                                                                                                                                                             |
| `components/material/SelectMenu.tsx`                         | On `mouseup`, traverses DOM upward from the anchor node to find the nearest `[data-start-time]` element; stores it via `setSelectionContentTimestamp`; clears it on empty selection                                                                                               |
| `context/TopicWorkspaceContext.tsx`                          | Added `selectionContentTimestampRef` (ref, not state, no re-render) + `setSelectionContentTimestamp` setter exposed through context; `getContentReference()` now reads `selectionContentTimestampRef.current` first, falls back to live `controllerRef.current?.getCurrentTime()` |

---

## Overview

This feature allows users to add selected text from learning materials (YouTube videos, PDFs, audio, and video files) to their notes while preserving a reference to the source content. When a user hovers over or clicks on referenced text in their notes, they can:

1. **See the reference information** — A shadcn `Tooltip` shows where the content came from (timestamp or page number)
2. **Navigate to the source** — Clicking on a YouTube or media reference seeks the player to the stored timestamp
3. **Get context** — For PDFs, the page number is stored; for videos/YouTube, the exact segment start time is saved

---

## Architecture

### Type Definitions (`types/note.type.ts`)

```typescript
export type ContentReferenceType = 'youtube' | 'file' | 'media';

export interface IContentReference {
    type: ContentReferenceType;
    timestamp?: number; // seconds — for youtube / media
    page?: number; // for file (PDF)
    videoId?: string; // for youtube
}

export interface INoteSegment {
    id: string;
    text: string;
    reference?: IContentReference;
}

export interface INote {
    noteId: number;
    topicId: number;
    userId: number;
    content: string;
    segments?: INoteSegment[];
}

export type IUpdateNotePayload = {
    topicId: number;
    content?: string;
    segments?: INoteSegment[];
};
```

> **Note:** `ContentReferenceType` uses `'file'` (not `'pdf'`) and `'media'` (not `'audio'`/`'video'` separately). All display logic uses these exact values.

---

### Core Components & Files

#### 1. Context Extensions (`context/TopicWorkspaceContext.tsx`)

New additions:

| Symbol                                    | Description                                                                                                                                                                                                                                    |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `selectionContentTimestampRef`            | `useRef<number \| null>(null)` — holds the transcript segment `startTime` captured at selection time; does **not** trigger re-renders                                                                                                          |
| `setSelectionContentTimestamp(timestamp)` | Setter exposed to `SelectMenu` via context; wrapped in `useCallback`                                                                                                                                                                           |
| `getContentReference()`                   | Returns `IContentReference` based on current `learningMaterial.type`. For `youtube`/`media`: reads `selectionContentTimestampRef.current` first, falls back to `controllerRef.current?.getCurrentTime() ?? 0`. For `file`: reads `pageNumber`. |
| `getCurrentPosition()`                    | Returns live timestamp or page number (unchanged behaviour)                                                                                                                                                                                    |

`getContentReference()` logic:

```typescript
const getContentReference = useCallback((): IContentReference | null => {
    if (!learningMaterial) return null;
    const reference: IContentReference = { type: learningMaterial.type as ContentReferenceType };

    if (learningMaterial.type === EnumLearningMaterial.youtube) {
        const timestamp = selectionContentTimestampRef.current ?? controllerRef.current?.getCurrentTime() ?? 0;
        reference.timestamp = Math.floor(timestamp);
        reference.videoId = learningMaterial.videoId;
    } else if (learningMaterial.type === EnumLearningMaterial.file) {
        reference.page = pageNumber;
    } else if (learningMaterial.type === EnumLearningMaterial.media) {
        const timestamp = selectionContentTimestampRef.current ?? controllerRef.current?.getCurrentTime() ?? 0;
        reference.timestamp = Math.floor(timestamp);
    }

    return reference;
}, [learningMaterial, pageNumber, controllerRef]);
```

---

#### 2. Media Player Controller (`media/core/MediaPlayerController.ts`)

Interface:

```typescript
export default interface MediaPlayerController {
    seekTo(seconds: number): void;
    play(): void;
    getCurrentTime(): number;
}
```

Adapters:

| Adapter                | `getCurrentTime()` implementation                                 |
| ---------------------- | ----------------------------------------------------------------- |
| `YoutubePlayerAdapter` | `return this.player.getCurrentTime() \|\| 0`                      |
| `VideoPlayerAdapter`   | `return this.playerRef.current?.currentTime \|\| 0`               |
| `AudioPlayerAdapter`   | `return this.audioRef.current?.audio.current?.currentTime \|\| 0` |

`useMediaPlayer` exposes `controllerRef` so the context can read `getCurrentTime()` without a component re-render.

---

#### 3. Transcript Viewer (`components/material/common/transcript/TranscriptViewer.tsx`)

Each segment row has `data-start-time` so `SelectMenu` can retrieve it via DOM traversal:

```tsx
<div
    key={index}
    data-start-time={segment.startTime}
    className="..."
    role="button"
    onClick={() => onSegmentClick(segment.startTime)}
>
```

---

#### 4. Selection Menu (`components/material/SelectMenu.tsx`)

Consumes `setSelectionContentTimestamp` from context. On `mouseup`:

1. If no text selected → calls `setSelectionContentTimestamp(null)` to clear any previous value.
2. If text selected → walks `anchorNode.parentElement` chain up to the container ref looking for the first `[data-start-time]` element; stores the parsed float via `setSelectionContentTimestamp`.

```typescript
let traverseNode: Node | null = anchorNode;
let capturedStartTime: number | null = null;
while (traverseNode && traverseNode !== node) {
    if (traverseNode instanceof HTMLElement && traverseNode.hasAttribute('data-start-time')) {
        const parsed = parseFloat(traverseNode.getAttribute('data-start-time') ?? '');
        if (!isNaN(parsed)) capturedStartTime = parsed;
        break;
    }
    traverseNode = traverseNode.parentElement;
}
setSelectionContentTimestamp(capturedStartTime);
```

---

#### 5. Add-to-Note Handler (`hooks/useSelectMenu.tsx`)

```typescript
const onAddToNoteClick = useCallback(async () => {
    const reference = getContentReference();
    const cleanedContent = getCleanedContent();

    // Escape HTML special characters
    const escapeHtml = (text: string) =>
        text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

    const escapedContent = escapeHtml(cleanedContent);

    const htmlContent = reference
        ? `<p data-reference="${btoa(JSON.stringify(reference))}">${escapedContent}</p>`
        : `<p>${escapedContent}</p>`;

    const currentContent = note?.content || '';
    const newContent = currentContent ? `${currentContent}<p></p>${htmlContent}` : htmlContent;
    await updateNoteAsync({ topicId, content: newContent });
}, [note, getCleanedContent, updateNoteAsync, topicId, getContentReference]);
```

---

#### 6. TipTap Editor (`components/note/RichTextEditor.tsx`)

`StarterKit` is configured with `paragraph: false`. The custom `ParagraphWithReference` extension replaces the default `Paragraph`:

```typescript
extensions: [
    StarterKit.configure({ paragraph: false, ... }),
    ParagraphWithReference,
    ...
]
```

---

#### 7. Custom Paragraph Extension (`components/note/ParagraphWithReference.ts`)

Extends TipTap's built-in `Paragraph` to preserve the `data-reference` attribute and render a React `NodeViewWrapper`:

```typescript
export const ParagraphWithReference = Paragraph.extend({
    addAttributes() {
        return {
            dataReference: {
                default: null,
                parseHTML: (element) => element.getAttribute('data-reference'),
                renderHTML: (attributes) =>
                    attributes.dataReference ? { 'data-reference': attributes.dataReference } : {},
            },
        };
    },
    addNodeView() {
        return ReactNodeViewRenderer(ReferenceNodeView);
    },
});
```

---

#### 8. Reference Node View (`components/note/ReferenceNodeView.tsx`)

React component rendered by `ParagraphWithReference` inside the editor. For paragraphs with a `data-reference` attribute:

- Wraps content in a shadcn `Tooltip`
- Tooltip content shows: reference label (formatted timestamp or page), material type, and "Click to jump" hint
- `onClick` calls `seekTo(reference.timestamp)` for `youtube` / `media` types
- Keyboard (`Enter`) support included
- Paragraphs without a reference render as a plain `<p>`

---

#### 9. Note Segment Renderer (`components/note/NoteSegmentRenderer.tsx`)

Standalone component for displaying note HTML outside the TipTap editor. Parses `innerHTML`, extracts `data-reference` from each `<p>`, and renders each segment either as a plain paragraph or a clickable tooltip-wrapped block with the same hover/click/keyboard behaviour as `ReferenceNodeView`.

---

#### 10. Reference Hook (`hooks/useNoteReferences.ts`)

Called once in `NoteTab`. Provides a global fallback layer using CSS + `MutationObserver` for any `[data-reference]` elements that exist outside the TipTap editor (e.g. initial load before React hydration):

- Injects a `<style id="note-reference-styles">` tag (deduplicated, removed on unmount)
- Queries all `[data-reference]` elements and attaches click + keydown handlers (idempotent via `data-reference-listener-added` guard)
- Observes `document.body` for new `[data-reference]` elements via `MutationObserver`

CSS injected:

```css
[data-reference] {
    position: relative;
    transition: background-color 0.2s ease;
}
[data-reference]:hover {
    background-color: rgba(234, 179, 8, 0.3);
    border-radius: 4px;
}
[data-reference]::after {
    content: '📌';
    margin-left: 4px;
    font-size: 0.75em;
    opacity: 0;
    transition: opacity 0.2s ease;
}
[data-reference]:hover::after {
    opacity: 1;
}
```

---

#### 11. Utility Functions (`utils/note-reference.utils.ts`)

Singleton `NoteReferenceUtils` class:

| Method                        | Description                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------------ |
| `encodeReference(ref)`        | `btoa(JSON.stringify(ref))` — safe try/catch                                               |
| `decodeReference(encoded)`    | `JSON.parse(atob(encoded))` — returns `null` on error/empty                                |
| `getReferenceFromElement(el)` | Reads `data-reference` attribute and decodes                                               |
| `formatReference(ref)`        | Returns human-readable string: `⏱ M:SS • YouTube` / `⏱ M:SS • Media` / `📄 Page N • PDF` |
| `getOriginUrl(ref)`           | Returns `https://www.youtube.com/watch?v=...&t=...` for YouTube, `null` otherwise          |

---

## Data Storage

Reference is stored as base64-encoded JSON in the `data-reference` HTML attribute:

```json
{ "type": "youtube", "timestamp": 345, "videoId": "dXwf7cW4fRQ" }
```

Encoded: `eyJ0eXBlIjoieW91dHViZSIsInRpbWVzdGFtcCI6MzQ1LCJ2aWRlb0lkIjoiZFh3ZjdjVzRmUlEifQ==`

Stored HTML fragment:

```html
<p data-reference="eyJ0eXBlIjoieW91dHViZSIsInRpbWVzdGFtcCI6MzQ1LCJ2aWRlb0lkIjoiZFh3ZjdjVzRmUlEifQ==">
    Selected transcript text here
</p>
```

---

## Features by Material Type

### YouTube Videos

- ✅ Captures segment `startTime` from `data-start-time` DOM attribute at selection time
- ✅ Falls back to live player `getCurrentTime()` when no DOM timestamp found
- ✅ Stores `videoId`
- ✅ Click in note seeks YouTube player to the saved timestamp
- ✅ Tooltip shows: `⏱ MM:SS • YouTube`

### PDF Files (`file`)

- ✅ Captures current `pageNumber` from context
- ✅ Tooltip shows: `📄 Page N • PDF`
- ⬜ Page navigation on click (future)

### Audio Files (`media`)

- ✅ Captures `selectionContentTimestampRef` (if set) or live `currentTime` via `AudioPlayerAdapter`
- ✅ Click seeks audio player to the saved timestamp
- ✅ Tooltip shows: `⏱ MM:SS • Media`

### Video Files (`media`)

- ✅ Captures `selectionContentTimestampRef` (if set) or live `currentTime` via `VideoPlayerAdapter`
- ✅ Click seeks video player to the saved timestamp
- ✅ Tooltip shows: `⏱ MM:SS • Media`

---

## Files Modified / Created

### New Files

| File                                        | Purpose                                                                                                       |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `types/note.type.ts`                        | `ContentReferenceType`, `IContentReference`, `INoteSegment`, `INote`, `IUpdateNotePayload`, `IUpdateNoteBody` |
| `utils/note-reference.utils.ts`             | `NoteReferenceUtils` singleton — encode, decode, format, getOriginUrl                                         |
| `components/note/ParagraphWithReference.ts` | TipTap `Paragraph` extension that preserves `data-reference` and renders `ReferenceNodeView`                  |
| `components/note/ReferenceNodeView.tsx`     | React NodeView rendered inside the editor — shadcn Tooltip + click-to-seek                                    |
| `components/note/NoteSegmentRenderer.tsx`   | Standalone renderer for note HTML outside the editor                                                          |
| `hooks/useNoteReferences.ts`                | Global CSS + MutationObserver fallback for `[data-reference]` elements                                        |

### Modified Files

| File                                                         | What changed                                                                                                                                                 |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `context/TopicWorkspaceContext.tsx`                          | Added `selectionContentTimestampRef`, `setSelectionContentTimestamp`; updated `getContentReference()` to prefer DOM timestamp; exposed both in context value |
| `media/core/MediaPlayerController.ts`                        | Added `getCurrentTime(): number` to interface                                                                                                                |
| `media/core/youtube/YoutubePlayerAdapter.ts`                 | Implemented `getCurrentTime()` via `this.player.getCurrentTime()`                                                                                            |
| `media/core/video/VideoPlayerAdapter.ts`                     | Implemented `getCurrentTime()` via `this.playerRef.current?.currentTime`                                                                                     |
| `media/core/audio/AudioPlayerAdapter.ts`                     | Implemented `getCurrentTime()` via `this.audioRef.current?.audio.current?.currentTime`                                                                       |
| `hooks/media/useMediaPlayer.tsx`                             | Exposed `controllerRef` in return value                                                                                                                      |
| `hooks/useSelectMenu.tsx`                                    | `onAddToNoteClick` — HTML-escape content, build `<p data-reference="...">` with `btoa`, append to existing note content                                      |
| `components/material/SelectMenu.tsx`                         | Reads `setSelectionContentTimestamp` from context; DOM traversal on `mouseup` to capture `data-start-time`                                                   |
| `components/material/common/transcript/TranscriptViewer.tsx` | Added `data-start-time={segment.startTime}` to each segment row                                                                                              |
| `components/tabs/NoteTab.tsx`                                | Calls `useNoteReferences()`                                                                                                                                  |
| `components/note/RichTextEditor.tsx`                         | `StarterKit` configured with `paragraph: false`; `ParagraphWithReference` added to extensions                                                                |

---

## Troubleshooting

### References not showing / no highlight

1. Verify `useNoteReferences()` is called inside `NoteTab`
2. Check that `ParagraphWithReference` is in the editor extension list and `StarterKit` has `paragraph: false`
3. Confirm `data-reference` attribute is present in the saved HTML (inspect via DevTools)

### Click jumps to 00:00 instead of correct timestamp

1. Confirm `data-start-time` is rendered on transcript segment rows in the DOM
2. Confirm `setSelectionContentTimestamp` is included in `TopicWorkspaceContext` value and `SelectMenu` destructures it
3. Check browser console — decode the `data-reference` value with `JSON.parse(atob(...))` and verify `timestamp`

### Tooltip not appearing

1. `ReferenceNodeView` requires shadcn `TooltipProvider` — verify it is present in the component tree
2. Check that `encodedRef` is non-null (paragraph has `data-reference` attribute)

### Encoded data corruption / decode failure

1. `btoa` will throw on non-Latin1 characters — the `escapeHtml` step in `onAddToNoteClick` prevents `<`/`>` and `&` injection but does not handle Unicode. If users select non-ASCII text, consider `encodeURIComponent` → `btoa`
2. Verify HTML sanitiser is not stripping `data-*` attributes in the backend or editor
