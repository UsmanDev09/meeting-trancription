import { NextResponse } from 'next/server';
import createClient from '@/lib/supabase';
import { cookies } from 'next/headers';

interface SlackChannel {
  id: string;
  name: string;
}

interface SlackResponse {
  ok: boolean;
  channels: SlackChannel[];
  response_metadata?: {
    next_cursor?: string;
  };
  error?: string;
}
async function fetchAllChannels(token: string) {
  const response = await fetch('https://slack.com/api/conversations.list', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  if (!data.ok) {
    throw new Error(data.error || 'Failed to fetch channels');
  }
  
  return data.channels.map((channel: any) => ({
    id: channel.id,
    name: channel.name,
  }));
}
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { data: slackTokenData, error: slackTokenError } = await supabase
      .from('user_slack_tokens')
      .select('slack_token')
      .eq('user_id', user.id)
      .single();

    if (slackTokenError || !slackTokenData) {
      return NextResponse.json({ error: 'Slack not connected' }, { status: 401 });
    }

    const slackToken = slackTokenData.slack_token;
    const channels = await fetchAllChannels(slackToken);
    return NextResponse.json({ channels });
  } catch (error: any) {
    console.error('Error fetching channels:', error);
    return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
  }
}
