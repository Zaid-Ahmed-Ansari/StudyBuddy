import { rateLimit } from "@/src/lib/rate-limit";
import { GoogleGenAI } from "@google/genai";
import { re } from "mathjs";

export const runtime = "edge";

export async function POST(req: Request) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  });

  const { prompt,context } = await req.json();
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const limitCheck = rateLimit(ip.toString(), 10, 60 * 1000); // 10 reqs/min

  if (!limitCheck.success) {
    return new Response(
      JSON.stringify({ message: "Too many requests. Please try again later." }),
      { status: 429 }
    );
  }
  const userContext = context.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');
  // Minimal text processing that preserves markdown structure
  function cleanText(text: string): string {
  return text
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Reduce 3+ newlines to 2
    .replace(/[ \t]+$/gm, '')         // Trim trailing spaces
    // Fix multiline code blocks
    .replace(/```(\w+)?\s*\n([\s\S]*?)\n```/g, (match, lang, code) => {
      const language = lang || '';
      const cleanCode = code.trim();
      return `\`\`\`${language}\n${cleanCode}\n\`\`\``;
    })
    // Convert inline backtick `words` or `phrases` (not real code) to bold
    .replace(/(^|[^`])`([^`\n]{1,50})`([^`]|$)/g, (match, before, content, after) => {
      // Heuristic: skip if the content looks like code (e.g., has parens, brackets, operators)
      const looksLikeCode = /[=(){}[\];<>+\-*\/]/.test(content);
      if (looksLikeCode) return match; // leave it as code
      return `${before}**${content.trim()}**${after}`;
    });
}



  
  try {
    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash-lite-preview-06-17",
      contents: `
The previous messages and the context for your next messages are ${userContext}
User's prompt: ${prompt}
`,config: {
      thinkingConfig: {
        thinkingBudget: 0, // Disables thinking
      },
      systemInstruction:  `You are StudyBuddy, a knowledgeable and supportive educational assistant designed to help with academic questions across all subjects. You maintain a friendly, professional tone while focusing exclusively on educational content.

      

RESPONSE GUIDELINES:
1. Answer only educational or academic questions, including casual greetings in an educational context.


2. Use appropriate formatting for different types of content, such as code, mathematics, or essays.
3. Act more like a tutor than a search engine, focusing on teaching and understanding rather than just providing answers.
4. NEVER use single backticks ( \`like this\` ) for emphasis. Use **bold** or *italics* instead.
Only use backticks for actual code or variable names.
5. Only use the number of words necessary to explain what user wants. Don't use extra words.


SUBJECT-SPECIFIC FORMATTING:

CODE:

Format the response in **Markdown** and follow this structure:


1. **Title Heading** (with the main concept)
2. **Brief Explanation** (what and why)
3. **Step-by-Step Guide** (with subheadings)
4. **Syntax-Highlighted Code Blocks**
5. **Final Complete Example** (if applicable)

❗Do NOT use single backticks (\`) around regular words or phrases.
Only use backticks for code, variable names, or syntax-specific text.




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

Always prioritize accuracy and educational value in your responses.`
    }
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