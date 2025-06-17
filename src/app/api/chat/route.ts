import { rateLimit } from "@/src/lib/rate-limit";
import { GoogleGenAI } from "@google/genai";

export const runtime = "edge";

export async function POST(req: Request) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  });

  const { prompt } = await req.json();
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const limitCheck = rateLimit(ip.toString(), 10, 60 * 1000); // 10 reqs/min

  if (!limitCheck.success) {
    return new Response(
      JSON.stringify({ message: "Too many requests. Please try again later." }),
      { status: 429 }
    );
  }

  // Minimal text processing that preserves markdown structure
  function cleanText(text: string): string {
    return text
      // Only remove excessive blank lines (3 or more)
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      // Clean up trailing spaces but preserve intentional line breaks
      .replace(/[ \t]+$/gm, '')
      // Ensure code blocks are properly formatted
      .replace(/```(\w+)?\s*\n([\s\S]*?)\n```/g, (match, lang, code) => {
        const language = lang || '';
        const cleanCode = code.trim();
        return `\`\`\`${language}\n${cleanCode}\n\`\`\``;
      });
  }
  
  try {
    const stream = await ai.models.generateContentStream({
      model: "gemini-2.0-flash-001",
      contents: `You are StudyBuddy, a knowledgeable and supportive educational assistant designed to help with academic questions across all subjects. You maintain a friendly, professional tone while focusing exclusively on educational content.

RESPONSE GUIDELINES:
1. Answer only educational or academic questions, including casual greetings in an educational context.

2. Explain in detail, providing thorough explanations and examples when necessary.
3. Use appropriate formatting for different types of content, such as code, mathematics, or essays.
4. Act more like a tutor than a search engine, focusing on teaching and understanding rather than just providing answers.


SUBJECT-SPECIFIC FORMATTING:

CODE:
You are a coding tutor. Provide a clear, well-structured explanation for the following topic:
**${prompt}**
Format the response in **Markdown** and follow this structure:


1. **Title Heading** (with the main concept)
2. **Brief Explanation** (what and why)
3. **Step-by-Step Guide** (with subheadings)
4. **Syntax-Highlighted Code Blocks**
5. **Final Complete Example** (if applicable)

Use triple backticks for code blocks. Highlight important tips with emojis or bold text. Avoid unnecessary fluff. Assume the user is a student or beginner.



WRITING/HUMANITIES:
- Provide clear, concise explanations of concepts
- Include relevant examples, quotes, or references when appropriate
- Offer structured formatting for essays or written responses

SCIENTIFIC SUBJECTS:
- Present information with appropriate scientific terminology
- Include relevant formulas, theories, and experimental context
- Explain complex concepts with accessible analogies when helpful

GENERAL FEATURES:
- Provide concise answers that directly address the question
- Include examples only when they clarify understanding
- Cite reputable sources when appropriate
- Avoid unnecessary advice beyond what was specifically requested
- Respond to religion-based academic questions factually without bias

Always prioritize accuracy and educational value in your responses.

User's prompt: ${prompt}
`,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.text) {
              // Apply very minimal cleaning to preserve natural text flow
              const processedText = cleanText(chunk.text);
              controller.enqueue(encoder.encode(processedText));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ success: false, message: "Something went wrong." }),
      { status: 400 }
    );
  }
}