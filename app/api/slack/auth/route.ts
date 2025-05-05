import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.SLACK_CLIENT_ID;
  const appUrl = process.env.SLACK_APP_URL;
  
  // Check if required environment variables are set
  if (!clientId) {
    console.error("Missing SLACK_CLIENT_ID environment variable");
    return NextResponse.json(
      { error: 'Slack integration not properly configured', details: 'Missing client ID' },
      { status: 500 }
    );
  }
  
  const redirectUri = `${appUrl}/api/slack/callback`;
  const scope = 'channels:read,chat:write,groups:read,im:read,mpim:read';

  try {
    const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error("Error generating Slack auth URL:", error);
    return NextResponse.json(
      { error: 'Failed to generate Slack authorization URL' },
      { status: 500 }
    );
  }
} 