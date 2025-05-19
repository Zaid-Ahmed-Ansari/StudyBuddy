import { rateLimit } from '@/src/lib/rate-limit';

import { NextResponse } from 'next/server';
import {GoogleGenAI} from '@google/genai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const ai = new GoogleGenAI({apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY});
  const { topic, subject } = await req.json();
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const limitCheck = rateLimit(ip.toString(), 10, 60 * 1000); // 10 reqs per minute

  if (!limitCheck.success) {
    return new NextResponse(
      JSON.stringify({ message: 'Too many requests. Please try again later.' }),
      { status: 429 }
    );
  }

  try {
    const { text } =  await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: `You are an expert note-taker.Not in many words but in just enough and provide proper spacing between lines. Generate **detailed, well-organized notes** for the following topics:

**Topic:** ${topic}  
**Subject:** ${subject}

### Guidelines:
- The notes should be structured with clear **headings** and **subheadings**.
- For each **subtopic**:
  - Provide a **short summary** of the concept.
  - List all **important points** with bullet points.
  - Explain key terms or concepts clearly.
  - Include **examples** or **analogies** where appropriate.
  - Ensure the notes are **useful for revision**, avoiding unnecessary filler.
  - Use **Markdown formatting**: headers, bullet points, and clear sections.

### Example Formatting:
1. **Introduction**
   - Summary of the topic
   - Key points
   - Explanation with example
2. **Subtopic 1**
   - Summary
   - Key points
   - Example or analogy

Format the output in clean **Markdown** for easy reading. Use headers, bullet points, code blocks, and emojis when necessary to make it engaging and useful.
Add proper spacing between sections and sub-sections for clarity.
`,

    });

    return NextResponse.json({ text });
  } catch (err) {
    console.error('Error generating notes:', err);
    return NextResponse.json(
      { success: false, message: 'Something went wrong while generating notes.' },
      { status: 500 }
    );
  }
}
