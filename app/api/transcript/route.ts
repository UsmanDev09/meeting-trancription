import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { meeting_id, transcript, user_id } = body;
    
    if (!meeting_id || !transcript || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields: meeting_id, transcript, or user_id' },
        { status: 400 }
      );
    }

    const { data: existingMeeting, error: fetchError } = await supabase
      .from('meetings')
      .select('id')
      .eq('meeting_id', meeting_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking meeting existence:', fetchError);
      return NextResponse.json(
        { error: 'Failed to check if meeting exists' },
        { status: 500 }
      );
    }

    let result;
    
    if (existingMeeting) {
      const { data, error } = await supabase
        .from('meetings')
        .update({ transcript })
        .eq('meeting_id', meeting_id)
        .select();
      
      if (error) throw error;
      result = { updated: true, data };
    } 
    else {
      const { data, error } = await supabase
        .from('meetings')
        .insert([{ 
          meeting_id, 
          transcript, 
          user_id,
          suggestion_count: 0
        }])
        .select();
      
      if (error) throw error;
      result = { inserted: true, data };
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error saving transcript:', error);
    return NextResponse.json(
      { error: 'Failed to save transcript' },
      { status: 500 }
    );
  }
}