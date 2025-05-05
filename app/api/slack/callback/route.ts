import { NextResponse } from 'next/server';
import { store } from '@/redux/store';
import { setSlackConnected, setTeamInfo } from '@/redux/slices/slackSlice';
import createClient from '@/lib/supabase';
import { cookies } from 'next/headers';
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const supabase = createClient();
  if (error) {
    console.error("Slack OAuth error:", error);
    return NextResponse.redirect(
      `https://d7e2-182-185-146-85.ngrok-free.app/?error=${encodeURIComponent(error)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `https://d7e2-182-185-146-85.ngrok-free.app/?error=no_code`
    );
  }

  try {
    // Get session token from cookies
    const accessToken = cookies().get('sb-access-token')?.value;
    
    if (!accessToken) {
      console.error("No session token found in cookies");
      return NextResponse.redirect(
        `https://d7e2-182-185-146-85.ngrok-free.app/?error=not_authenticated`
      );
    }

    // Use the token to get the user
    const { data: { user }, error: userError } = await (await supabase).auth.getUser();
    console.log("User details in callback function",user)
    if (userError || !user) {
      console.error("User authentication error:", userError);
      return NextResponse.redirect(
        `https://d7e2-182-185-146-85.ngrok-free.app/?error=not_authenticated`
      );
    }

    // Exchange code for access token
    const response = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        code,
        redirect_uri: `https://d7e2-182-185-146-85.ngrok-free.app/api/slack/callback`,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error("Slack token exchange error:", data.error);
      return NextResponse.redirect(
        `https://d7e2-182-185-146-85.ngrok-free.app/?error=${encodeURIComponent(
          data.error
        )}`
      );
    }

    // Store Slack token in database
    const { error: dbError } = await (await supabase).from("user_slack_tokens").upsert({
      user_id: user.id,
      slack_token: data.access_token,
      slack_team_id: data.team.id,
      slack_team_name: data.team.name,
    });

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.redirect(
        `https://d7e2-182-185-146-85.ngrok-free.app/?error=database_error`
      );
    }

    // Update Redux state
    store.dispatch(setSlackConnected(true));
    store.dispatch(
      setTeamInfo({
        id: data.team.id,
        name: data.team.name,
        domain: data.team.domain,
        token: data.access_token,
      })
    );

    return NextResponse.redirect(
      `https://d7e2-182-185-146-85.ngrok-free.app/note/?success=true`
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.redirect(
      `https://d7e2-182-185-146-85.ngrok-free.app/note/?error=server_error`
    );
  }
} 