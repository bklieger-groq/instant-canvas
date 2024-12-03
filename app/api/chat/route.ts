import { createGroq } from '@ai-sdk/groq';
import { StreamingTextResponse, streamText } from 'ai';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const { textStream } = await streamText({
    model: groq('llama-3.1-70b-versatile'),
    messages: messages.map(message => ({
      role: message.role,
      content: message.content
    }))
  });

  // Create a ReadableStream from the textStream
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of textStream) {
        controller.enqueue(chunk);
      }
      controller.close();
    }
  });

  return new StreamingTextResponse(stream);
}