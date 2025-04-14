import { NextResponse } from 'next/server';

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

async function fetchAllChannels(slackToken: string): Promise<SlackChannel[]> {
  let channels: SlackChannel[] = [];
  let cursor: string | undefined = undefined;

  do {
    const params = new URLSearchParams({
      limit: '100',
      types: 'public_channel,private_channel',
    });
    if (cursor) {
      params.append('cursor', cursor);
    }

    const response = await fetch(
      `https://slack.com/api/conversations.list?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${slackToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const data: SlackResponse = await response.json();
    if (!data.ok) {
      throw new Error(data.error || 'Failed to fetch channels');
    }

    channels = channels.concat(data.channels);
    cursor = data.response_metadata?.next_cursor;
  } while (cursor);

  return channels;
}

export async function GET(request: Request) {
  try {
    const slackToken = process.env.SLACK_TOKEN;
    if (!slackToken) {
      return NextResponse.json({ error: 'Missing Slack configuration' }, { status: 500 });
    }

    const channels = await fetchAllChannels(slackToken);
    return NextResponse.json({ channels });
  } catch (error: any) {
    console.error('Error fetching channels:', error);
    return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
  }
}
