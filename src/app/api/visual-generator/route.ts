import { rateLimit } from '@/src/lib/rate-limit';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { mode, prompt, xLabel, yLabel, dataPoints } = await req.json();
  const ip = req.headers.get('x-forwarded-for') || 'unknown';

  const limitCheck = rateLimit(ip.toString(), 10, 60 * 1000);
  if (!limitCheck.success) {
    return new NextResponse(
      JSON.stringify({ message: 'Too many requests. Please try again later.' }),
      { status: 429 }
    );
  }

  try {
    if (mode === 'flowchart') {
      const { text } = await generateText({
        model: google('gemini-1.5-flash'),
        prompt: `Generate a clean, valid Mermaid.js flowchart diagram for this description: "${prompt}". 
           ONLY return the Mermaid diagram code between triple backticks \`\`\`mermaid ... \`\`\`.
           Do NOT include any explanation, extra text, or markdown outside the code block.`,
      });

      return NextResponse.json({ mermaid: text });
    }

    

    

    return new NextResponse(JSON.stringify({ message: 'Invalid mode' }), { status: 400 });

  } catch (err) {
    console.error(err);
    return new NextResponse(JSON.stringify({ message: 'AI generation failed' }), { status: 500 });
  }
}
