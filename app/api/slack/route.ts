export async function POST(request: Request) {
  try {
    const SLACK_TOKEN = process.env.SLACK_TOKEN;
    if (!SLACK_TOKEN) {
      return new Response(
        JSON.stringify({ error: "Missing Slack configuration" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const { transcript, summary, selectedChannels } = await request.json();

    if (!Array.isArray(selectedChannels) || selectedChannels.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid channels provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!transcript && !summary) {
      return new Response(
        JSON.stringify({ error: "No transcript or summary provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let textMessage = "";
    if (transcript && summary) {
      textMessage = `*Meeting Summary:*\n${summary}\n\n*Transcript:*\n${transcript}`;
    } else if (summary) {
      textMessage = `*Meeting Summary:*\n${summary}`;
    } else if (transcript) {
      textMessage = `*Transcript:*\n${transcript}`;
    }

    const postResults = [];

    for (const channelId of selectedChannels) {
      const slackResponse = await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SLACK_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel: channelId,
          text: textMessage,
        }),
      });

      const data = await slackResponse.json();

      if (!data.ok) {
        console.error(`Failed to post to channel ${channelId}:`, data.error);
        postResults.push({ channel: channelId, success: false, error: data.error });
      } else {
        postResults.push({ channel: channelId, success: true });
      }
    }

    return new Response(JSON.stringify({ results: postResults }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error posting to Slack:", error);
    return new Response(
      JSON.stringify({ error: "Failed to post to Slack" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
