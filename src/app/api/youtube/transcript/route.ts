import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const videoId = url.searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json({ error: 'Missing video ID' }, { status: 400 });
  }

  try {
    const response = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.5',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    // Extract player response data
    const YT_INITIAL_PLAYER_RESPONSE_RE =
      /ytInitialPlayerResponse\s*=\s*({.+?})\s*;\s*(?:var\s+(?:meta|head)|<\/script|\n)/;
    const playerResponseMatch = response.data.match(YT_INITIAL_PLAYER_RESPONSE_RE);

    if (!playerResponseMatch) {
      return NextResponse.json(
        { error: 'Unable to parse player response data from YouTube' },
        { status: 500 },
      );
    }

    const playerResponse = JSON.parse(playerResponseMatch[1]);

    const metadata = {
      title: playerResponse.videoDetails.title,
      duration: playerResponse.videoDetails.lengthSeconds,
      author: playerResponse.videoDetails.author,
      views: playerResponse.videoDetails.viewCount,
      thumbnailUrl: playerResponse.videoDetails.thumbnail?.thumbnails?.pop()?.url || '',
      playbackTracking: playerResponse.playbackTracking,
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

    // Get the transcript
    const transcriptResponse = await axios.get(`${tracks[0].baseUrl}&fmt=json3`);
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
  } catch (error) {
    console.error('Error retrieving transcript:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to retrieve transcript from YouTube',
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
