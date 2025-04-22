import { streamText } from 'ai';
import { createGroq } from "@ai-sdk/groq";
const model = createGroq({ apiKey: process.env.GROQ_API_KEY! })("llama3-70b-8192")

export async function POST(req: Request) {
    const { messages } = await req.json();
    console.log("Inside post request",messages[0].content)
    const  prompt  = messages[0].content;
    console.log("Prompt",prompt)
  try {
    const result = streamText({
      model: model,
      system: 'You are a helpful assistant.',
      prompt: prompt,
      temperature: 0.7,
      maxTokens: 2000
    });
    console.log(result)
    return result.toDataStreamResponse();
    
  } catch (error) {
    console.error('Error in course generation:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate course' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}