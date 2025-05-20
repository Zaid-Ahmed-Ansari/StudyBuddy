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
      contents: `You are a precise, expert note-taker skilled in creating concise yet comprehensive study materials. Generate clear, scannable notes for:

**Topic:** ${topic}  
**Subject:** ${subject}

## FORMAT GUIDELINES:

### STRUCTURE:
- Use hierarchical organization with H2 (##) for main sections and H3 (###) for subsections
- Maintain consistent white space between sections (one blank line) for readability
- Include a brief introduction (2-3 sentences maximum)

### FOR EACH SECTION:
- Begin with a 1-2 sentence definition/overview
- Use bullet points (•) for key concepts and dash (-) for supporting details
- Include only essential information that would appear on an exam
- Highlight **key terms** in bold
- Add ✏️ before examples and 💡 before important insights

### CONTENT BALANCE:
- Prioritize clarity over comprehensiveness
- Include 1-2 targeted examples per major concept
- Add brief mnemonics or memory aids where helpful
- For formulas: present in \`\`\`math blocks with a simple application example

### VISUAL ORGANIZATION:
- Use tables for comparing related concepts
- Create simple diagrams using ASCII/Unicode when helpful
- Limit each main section to 5-7 bullet points maximum
- Include a brief summary (3-4 bullet points) at the end

Keep the total length focused and concise - aim for notes that would fit on 2-3 pages if printed.
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
