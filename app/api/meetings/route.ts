import { NextResponse } from 'next/server';
import createClient from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const meetingId = searchParams.get('meeting_id');
    const userId = searchParams.get('user_id');

    const supabase = await createClient();
    let query = supabase.from('meetings').select('*');

    if (meetingId) {
      query = query.eq('meeting_id', meetingId);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }
    const formattedMeetings = data.map(meeting => {
      let messages = [];
      
      try {
        if (typeof meeting.transcript === 'string') {
          if (meeting.transcript.trim().startsWith('[')) {
            try {
              const parsed = JSON.parse(meeting.transcript);
              if (Array.isArray(parsed)) {
                messages = parsed;
              }
            } catch (parseError) {
              console.error('Error parsing transcript as JSON array:', parseError);
            }
          } 
          
          if (messages.length === 0 && meeting.transcript.trim().startsWith('{')) {
            try {
              const parsed = JSON.parse(meeting.transcript);
              if (parsed.messages && Array.isArray(parsed.messages)) {
                messages = parsed.messages;
              }
            } catch (parseError) {
              console.error('Error parsing transcript as JSON object:', parseError);
            }
          }
          
          if (messages.length === 0) {
            const lines = meeting.transcript.split('\n').filter((line: string) => line.trim());
            const messageRegex = /^([^(]+)\s*\(([^)]+)\):\s*(.+)$/;
            
            messages = lines.map((line: string, index: number) => {
              const match = line.match(messageRegex);
              
              if (match) {
                const [_, speaker, time, text] = match;
                return {
                  id: String(index + 1),
                  speaker: speaker.trim(),
                  initial: speaker.trim()[0] || 'U',
                  time: time.trim(),
                  text: text.trim()
                };
              } else {
                return {
                  id: String(index + 1),
                  speaker: "Unknown",
                  initial: "U",
                  time: "0:00",
                  text: line.trim()
                };
              }
            });
          }
        } else if (typeof meeting.transcript === 'object' && meeting.transcript !== null) {
          if (Array.isArray(meeting.transcript)) {
            messages = meeting.transcript;
          } else if (meeting.transcript.messages && Array.isArray(meeting.transcript.messages)) {
            messages = meeting.transcript.messages;
          }
        }
        
        if (!messages || messages.length === 0) {
          messages = [{
            id: "1",
            speaker: "Transcript",
            initial: "T",
            time: "0:00",
            text: typeof meeting.transcript === 'string' 
              ? meeting.transcript 
              : 'Transcript data is not available in text format'
          }];
        }
      } catch (e) {
        console.error('Error processing transcript:', e);
        messages = [{
          id: "1",
          speaker: "Transcript",
          initial: "T",
          time: "0:00",
          text: typeof meeting.transcript === 'string' 
            ? meeting.transcript 
            : 'Error processing transcript'
        }];
      }

      return {
        ...meeting,
        messages
      };
    });

    return NextResponse.json(formattedMeetings, { status: 200 });
  } catch (error) {
    console.error('Error fetching transcripts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transcripts', details: error },
      { status: 500 }
    );
  }
} 