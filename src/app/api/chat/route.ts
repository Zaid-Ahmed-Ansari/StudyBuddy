import { GoogleGenAI, createUserContent, createPartFromUri } from "@google/genai";
import { rateLimit } from "@/src/lib/rate-limit";

export const runtime = "edge";

export async function POST(req: Request) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
  });

  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const limitCheck = rateLimit(ip.toString(), 10, 60 * 1000);
  if (!limitCheck.success) {
    return new Response(
      JSON.stringify({ message: "Too many requests. Please try again later." }),
      { status: 429 }
    );
  }

  const formData = await req.formData();
  const prompt = formData.get("prompt")?.toString() || "";
  const contextRaw = formData.get("context")?.toString() || "[]";
  const context = JSON.parse(contextRaw);

  const files = formData.getAll("file") as File[];

  const userContext = context.map((msg: any) =>
    `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
  ).join('\n');

  function cleanText(text: string): string {
    return text
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/[ \t]+$/gm, '')
      .replace(/```(\w+)?\s*\n([\s\S]*?)\n```/g, (match, lang, code) => {
        const language = lang || '';
        const cleanCode = code.trim();
        return `\`\`\`${language}\n${cleanCode}\n\`\`\``;
      })
      .replace(/(^|[^`])`([^`\n]{1,50})`([^`]|$)/g, (match, before, content, after) => {
        const looksLikeCode = /[=(){}[\];<>+\-*\/]/.test(content);
        if (looksLikeCode) return match;
        return `${before}**${content.trim()}**${after}`;
      });
  }

  try {
    const contentParts: any[] = [prompt];

    for (const file of files) {
      const mimeType = file.type;
      const arrayBuffer = await file.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString("base64");

      if (mimeType.startsWith("image/")) {
        const uploaded = await ai.files.upload({ file });
        const part = await createPartFromUri(uploaded.uri, mimeType);
        contentParts.push(part);
      } else if (mimeType === "application/pdf") {
        contentParts.push({
          inlineData: {
            mimeType,
            data: base64Data,
          },
        });
      } else {
        console.warn(`Unsupported file type: ${mimeType}`);
        continue;
      }
    }

    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash-lite-preview-06-17",
      contents: [
        createUserContent(contentParts),
        createUserContent([ `
          The previous messages and the context for your next messages are ${userContext}
          User's prompt: ${prompt}
          `])
      ],
      config: {
        systemInstruction: `You are StudyBuddy, a knowledgeable and supportive educational assistant designed to help with academic questions across all subjects. You maintain a friendly, professional tone while focusing exclusively on educational content.

      

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
6. Put the mathematical equations in the middle of the screen.

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


,
      },
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.text) {
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
