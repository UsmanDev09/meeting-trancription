import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getSlackToken(userId: string) {
  const { data, error } = await supabase
    .from('user_slack_tokens')
    .select('slack_token')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching Slack token:', error);
    return null;
  }

  return data?.slack_token;
}

export async function sendToSlack(userId: string, channel: string, text: string) {
  const token = await getSlackToken(userId);
  
  if (!token) {
    throw new Error('No Slack token found. Please connect your Slack account first.');
  }

  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      channel,
      text
    })
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(data.error || 'Failed to send message to Slack');
  }

  return data;
} 