import { rateLimit } from '@/src/lib/rate-limit';
import {GoogleGenAI} from '@google/genai';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  const ai = new GoogleGenAI({apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY});
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
      const { text } =  await ai.models.generateContent({
        model:'gemini-2.0-flash-001',
        contents: `Generate a clean, valid Mermaid.js flowchart diagram for this description: "${prompt}". 
           ONLY return the Mermaid diagram code between triple backticks \`\`\`mermaid ... \`\`\`.
           Do NOT include any explanation, extra text, or markdown outside the code block. Process the code properly for ERD's`,
      });

      return NextResponse.json({ mermaid: text });
    }

    

    

    return new NextResponse(JSON.stringify({ message: 'Invalid mode' }), { status: 400 });

  } catch (err) {
    console.error(err);
    return new NextResponse(JSON.stringify({ message: 'AI generation failed' }), { status: 500 });
  }
}
