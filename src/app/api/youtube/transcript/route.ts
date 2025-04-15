import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const videoId = url.searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json({ error: 'Missing video ID' }, { status: 400 });
  }

  try {
    // Add more browser-like headers
    const response = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.5',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        Referer: 'https://www.youtube.com/',
        Connection: 'keep-alive',
        'Cache-Control': 'max-age=0',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 10000, // Increase timeout
    });

    // Add more detailed logging for debugging
    console.log('Response status:', response.status);

    // Extract player response data
    const YT_INITIAL_PLAYER_RESPONSE_RE =
      /ytInitialPlayerResponse\s*=\s*({.+?})\s*;\s*(?:var\s+(?:meta|head)|<\/script|\n)/;
    const playerResponseMatch = response.data.match(YT_INITIAL_PLAYER_RESPONSE_RE);

    if (!playerResponseMatch) {
      console.error('Failed to match YouTube player response pattern');
      return NextResponse.json(
        { error: 'Unable to parse player response data from YouTube' },
        { status: 500 },
      );
    }

    try {
      const playerResponse = JSON.parse(playerResponseMatch[1]);

      // Debug logging
      console.log('Player response structure:', Object.keys(playerResponse).join(', '));

      // Check if videoDetails exists
      if (!playerResponse.videoDetails) {
        console.error('Missing videoDetails in player response');
        return NextResponse.json(
          { error: 'Unable to retrieve video details from YouTube' },
          { status: 500 },
        );
      }

      const metadata = {
        title: playerResponse.videoDetails?.title || 'Unknown Title',
        duration: playerResponse.videoDetails?.lengthSeconds || '0',
        author: playerResponse.videoDetails?.author || 'Unknown Author',
        views: playerResponse.videoDetails?.viewCount || '0',
        thumbnailUrl: playerResponse.videoDetails?.thumbnail?.thumbnails?.[0]?.url || '',
      };

      // Check if captions are available
      if (!playerResponse.captions?.playerCaptionsTracklistRenderer?.captionTracks) {
        return NextResponse.json(
          { error: 'This video does not have captions available' },
          { status: 404 },
        );
      }

      // Get the tracks and sort them
      const tracks = playerResponse.captions.playerCaptionsTracklistRenderer.captionTracks;
      tracks.sort(compareTracks);

      if (tracks.length === 0) {
        return NextResponse.json(
          { error: 'No caption tracks found for this video' },
          { status: 404 },
        );
      }

      // Get the transcript with same browser-like headers
      const transcriptResponse = await axios.get(`${tracks[0].baseUrl}&fmt=json3`, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: `https://www.youtube.com/watch?v=${videoId}`,
        },
      });

      const transcriptData = transcriptResponse.data;

      // Parse the transcript
      const parsedTranscript = transcriptData.events
        // Remove invalid segments
        .filter((x: any) => x.segs)
        // Concatenate into single long string
        .map((x: any) => {
          return x.segs.map((y: any) => y.utf8).join(' ');
        })
        .join(' ')
        // Remove invalid characters
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        // Replace any whitespace with a single space
        .replace(/\s+/g, ' ');

      return NextResponse.json({
        success: true,
        transcript: parsedTranscript,
        metadata,
      });
    } catch (parseError) {
      console.error('Error parsing player response JSON:', parseError);
      return NextResponse.json({ error: 'Failed to parse YouTube player data' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error retrieving transcript:', error);
    // More detailed error logging
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      responseData: error.response?.data,
      responseStatus: error.response?.status,
    };
    console.error('Error details:', JSON.stringify(errorDetails));

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to retrieve transcript from YouTube',
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
      },
      { status: 500 },
    );
  }
}

// Sort tracks giving preference to English and non-auto-generated captions
function compareTracks(track1: any, track2: any) {
  const langCode1 = track1.languageCode;
  const langCode2 = track2.languageCode;

  if (langCode1 === 'en' && langCode2 !== 'en') {
    return -1; // English comes first
  } else if (langCode1 !== 'en' && langCode2 === 'en') {
    return 1; // English comes first
  } else if (track1.kind !== 'asr' && track2.kind === 'asr') {
    return -1; // Non-ASR comes first (non-auto-generated)
  } else if (track1.kind === 'asr' && track2.kind !== 'asr') {
    return 1; // Non-ASR comes first (non-auto-generated)
  }

  return 0; // Preserve order if both have same priority
}
