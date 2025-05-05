import createClient from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  try {
    const { transcript, summary, selectedChannels } = await request.json();
    if (!transcript || !summary || !selectedChannels || !selectedChannels.length) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { data: slackTokenData, error: tokenError } = await supabase
      .from('user_slack_tokens')
      .select('slack_token')
      .eq('user_id', user.id)
      .single();

    if (tokenError || !slackTokenData?.slack_token) {
      return NextResponse.json({ error: 'Slack not connected' }, { status: 401 });
    }

    const slackToken = slackTokenData.slack_token;
    const message = {
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Meeting Summary*"
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: summary
          }
        },
        {
          type: "divider"
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Transcript*"
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: transcript.length > 3000 ? transcript.substring(0, 3000) + "..." : transcript
          }
        }
      ]
    };
    const results = [];
    for (const channelId of selectedChannels) {
      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${slackToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channel: channelId,
          ...message
        })
      });

      const result = await response.json();
      results.push({ channelId, success: result.ok, error: result.error });
      
      if (!result.ok) {
        console.error(`Error posting to channel ${channelId}:`, result.error);
      }
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Error posting to Slack:', error);
    return NextResponse.json({ error: 'Failed to post to Slack' }, { status: 500 });
  }
}
