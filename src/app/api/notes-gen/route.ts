import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { topic, subject } = await req.json();

  try {
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      prompt: `You are an expert note-taker. Generate **detailed, well-organized notes** for the following topics:

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
maxTokens:1500
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
