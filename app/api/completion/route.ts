import { streamText } from 'ai';
import { createGroq } from "@ai-sdk/groq";

const model = createGroq({ apiKey: process.env.GROQ_API_KEY! })("llama3-70b-8192");

export async function POST(req: Request) {
  const { prompt } = await req.json();
  
  try {
    const result = streamText({
      model: model,
      system: `You are a helpful assistant that answers questions about meeting transcripts.
Be concise and informative. Your responses should be directly based on the transcript context provided.
If the information is not in the transcript, acknowledge that but try to provide a helpful response.
Focus on extracting relevant information from the meeting context.`,
      prompt: prompt,
      temperature: 0.5,
      maxTokens: 1000
    });
    
    return result.toDataStreamResponse();
    
  } catch (error) {
    console.error('Error in completion generation:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate completion' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 