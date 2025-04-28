import { NextResponse } from 'next/server';
import createClient from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Fetch all analytics events without filtering
    const { data, error } = await supabase
      .from('analytics')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in analytics API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data', details: error },
      { status: 500 }
    );
  }
} 