import { NextResponse } from 'next/server';
import { joinGoogleMeetAndTranscribe } from '@/lib/puppeteer-automation';
import createClient from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // Get the current user from Supabase
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the meeting URL from the request body
    const { meetingUrl, duration } = await request.json();
    
    if (!meetingUrl) {
      return NextResponse.json({ error: 'Missing meeting URL' }, { status: 400 });
    }

    // Validate the URL
    try {
      const url = new URL(meetingUrl);
      if (url.hostname !== 'meet.google.com') {
        return NextResponse.json({ error: 'Only Google Meet URLs are supported' }, { status: 400 });
      }
    } catch (error) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Extract meeting ID from URL for database recording
    const meetingId = new URL(meetingUrl).pathname.replace('/', '');
    
    // Create a record in the database before starting the bot
    const { error: dbError } = await supabase.from('bot_sessions').insert({
      user_id: user.id,
      meeting_id: meetingId,
      meeting_url: meetingUrl,
      status: 'starting',
      requested_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error('Error recording bot session:', dbError);
    }

    // Start the bot process independently from this request
    // Use Promise.resolve().then() to ensure this runs after the response is sent
    Promise.resolve().then(async () => {
      try {
        console.log(`Starting bot for meeting: ${meetingId}`);
        const result = await joinGoogleMeetAndTranscribe(meetingUrl, duration || 60);
        console.log(`Bot process completed with result:`, result);
      } catch (botError) {
        console.error(`Bot process error for meeting ${meetingId}:`, botError);
      }
    });

    // Return success immediately without waiting for the bot
    return NextResponse.json({ 
      success: true,
      message: 'Bot is joining the meeting',
      meetingId 
    });
  } catch (error: any) {
    console.error('Error starting meeting bot:', error);
    return NextResponse.json({ 
      error: 'Failed to start meeting bot',
      details: error.message
    }, { status: 500 });
  }
} 