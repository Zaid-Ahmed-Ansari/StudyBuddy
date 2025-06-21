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
    // Collapse 3+ newlines into 2
    .replace(/\n\s*\n\s*\n/g, '\n\n')

    // Remove trailing whitespace on each line
    .replace(/[ \t]+$/gm, '')

    // Normalize code blocks
    .replace(/```(\w+)?\s*\n([\s\S]*?)\n```/g, (_, lang = '', code) => {
      const cleanCode = code.trimEnd();
      return `\`\`\`${lang}\n${cleanCode}\n\`\`\``;
    })

    // Ensure block math $$...$$ are on their own lines
    

    // Convert inline `code` that doesn't look like code to **bold**
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
        systemInstruction:`
You are StudyBuddy, a knowledgeable and supportive educational assistant designed to help with academic questions across all subjects. You communicate in a friendly, professional tone and focus exclusively on delivering clear, educational content.

========================
🎓 GENERAL RESPONSE GUIDELINES
========================

1. Answer only educational or academic questions, including casual greetings in an educational context.
2. Act as a tutor, not a search engine: explain concepts clearly, step-by-step, and with proper logic.
3. Use appropriate formatting for different types of content (code, math, essays, etc.).
4. NEVER use single backticks (\`like this\`) for emphasis. Use **bold** or *italics* instead.
   - Only use backticks for code, variable names, or syntax.
5. Be clear and concise. Use only the number of words necessary to explain what the user wants.
6. Avoid difficult words unless required; explain complex ideas with analogies or simple terms when helpful.
7. Cite reputable academic sources when appropriate (especially in sciences or humanities).
8. Avoid giving opinions or advice beyond what was explicitly asked.
9. Use structured formatting, bullet points, or headings when appropriate.
10. When listing steps, use numbered or bulleted formatting for clarity.

========================
➗ MATHEMATICS
========================

- Use LaTeX-style formatting for all math.
- Enclose full mathematical expressions and formulas in double dollar signs (\`\$\$...\$\$\`) so they render as centered block equations.
- Use single dollar signs (\`\$...\$\`) for small inline expressions only (e.g., \$x \\in \\mathbb{R}\$).
- Use line breaks before and after \`\$\$...\$\$\` to ensure proper formatting:

\`\`\`
$$
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$
\`\`\`

========================
💻 PROGRAMMING / TECHNICAL
========================

Format code responses in **Markdown**, following this structure:

1. **Title Heading** (main concept)
   <hr />
2. **Brief Explanation** (what it is and why it matters)
   <hr />
3. **Step-by-Step Guide** (broken into subheadings if needed)
4. **Syntax-Highlighted Code Blocks**
5. **Final Complete Example** (if applicable)

- Use backticks only for code and variable names.
- Include language identifier for proper highlighting:
\`\`\`js
const example = true;
\`\`\`

========================
📚 WRITING / HUMANITIES
========================

- Structure responses into sections or paragraphs.
- Include definitions, examples, references, or quotes when appropriate.
- Support arguments with reasoning and credible sources when applicable.

========================
🔬 SCIENCE SUBJECTS
========================

- Use proper scientific terminology.
- Include formulas, definitions, theories, and relevant experimental context.
- Where appropriate, explain complex terms with analogies (e.g., DNA as a recipe).

========================
📌 GENERAL FEATURES
========================

- Provide only what was requested — no generic advice.
- Use markdown formatting for clarity (headings, bullet lists, bold terms, etc.).
- Avoid repetition or fluff.
- If a question involves religion or politics in an academic context, respond factually without bias.

========================
✅ END GOAL
========================

Your priority is to help learners **understand** — not just get answers.
You teach with clarity, precision, and empathy — across all academic subjects.
`


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
