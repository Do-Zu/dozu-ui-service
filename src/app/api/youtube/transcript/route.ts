import { NextResponse } from 'next/server';
import { Innertube } from 'youtubei.js/web';

export const maxDuration = 30; // Increase the duration limit for this API endpoint

export async function GET(request: Request) {
    const url = new URL(request.url);
    const videoId = url.searchParams.get('videoId');

    if (!videoId) {
        return NextResponse.json({ error: 'Missing video ID' }, { status: 400 });
    }

    try {
        // Initialize the YouTube client with youtubei.js
        const youtube = await Innertube.create({
            lang: 'en',
            location: 'US',
            retrieve_player: false,
        });

        // Fetch video info and transcript
        const info = await youtube.getInfo(videoId);

        // Make sure we have video info before proceeding
        if (!info) {
            return NextResponse.json({ error: 'Could not retrieve video information' }, { status: 404 });
        }

        const metadata = {
            title: info.basic_info.title || 'Unknown Title',
            duration: info.basic_info.duration || '0',
            author: info.basic_info.channel?.name || 'Unknown Author',
            views: info.basic_info.view_count?.toString() || '0',
            thumbnailUrl: info.basic_info.thumbnail?.[0]?.url || '',
            embed: info.basic_info.embed,
        };

        try {
            const transcriptData = await info.getTranscript();

            if (!transcriptData || !transcriptData.transcript?.content?.body?.initial_segments) {
                return NextResponse.json({ error: 'This video does not have captions available' }, { status: 404 });
            }

            const transcriptSegments = transcriptData.transcript.content.body.initial_segments.map((segment: any) => ({
                text: segment.snippet.text,
                startTime: segment.start_ms ? Math.floor(segment.start_ms / 1000) : 0,
                duration: segment.duration_ms ? Math.floor(segment.duration_ms / 1000) : 0,
            }));

            // Still provide a full transcript for backward compatibility
            const fullTranscript = transcriptSegments
                .map((segment) => segment.text)
                .join(' ')
                .replace(/[\u200B-\u200D\uFEFF]/g, '')
                .replace(/\s+/g, ' ');

            return NextResponse.json({
                success: true,
                transcript: fullTranscript,
                transcriptSegments: transcriptSegments,
                metadata,
            });
        } catch (transcriptError) {
            console.error('Error fetching transcript data:', transcriptError);
            return NextResponse.json({ error: 'Failed to retrieve transcript from YouTube video' }, { status: 404 });
        }
    } catch (error: any) {
        console.error('Error retrieving transcript:', error);
        // More detailed error logging
        const errorDetails = {
            message: error.message,
            stack: error.stack,
        };
        console.error('Error details:', JSON.stringify(errorDetails));

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to retrieve transcript from YouTube',
                details: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
            },
            { status: 500 },
        );
    }
}
