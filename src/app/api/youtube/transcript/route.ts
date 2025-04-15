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

    // Check if videoDetails exists
    if (!playerResponse.videoDetails) {
      console.error('Missing videoDetails in player response');
      return NextResponse.json(
        { error: 'Unable to retrieve video details from YouTube' },
        { status: 500 },
      );
    }

    const metadata = {
      title: playerResponse.videoDetails.title || 'Unknown Title',
      duration: playerResponse.videoDetails.lengthSeconds || '0',
      author: playerResponse.videoDetails.author || 'Unknown Author',
      views: playerResponse.videoDetails.viewCount || '0',
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
