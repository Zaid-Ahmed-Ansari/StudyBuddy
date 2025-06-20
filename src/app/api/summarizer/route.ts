import {GoogleGenAI} from '@google/genai';

export const runtime = "edge";

export async function POST(req: Request) {
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
  const ai = new GoogleGenAI({apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY});
  try {
    const { text } = await req.json();

    const result =  await ai.models.generateContent({
      model: "gemini-2.5-flash-lite-preview-06-17",
      contents: text,
      config:{
        systemInstruction:`You are an expert academic assistant. Read the following content carefully and generate a concise, well-organized summary in bullet points. Focus on extracting key concepts, important facts, and any chronological or logical structure in the material.

Format the summary clearly with headings if necessary, and ensure it's easy to review for study purposes. If the content includes definitions, terms, dates, or examples, include them briefly in the summary. Give the output in a markdown format.
Text to be summarized is in the prompt.`
      }
    });
    const cleanedText = cleanText(result.text);
    return Response.json({ text: cleanedText });
  } catch (err) {
    console.error("Summarization failed:", err);
    return Response.json({ error: "Summarization failed" }, { status: 500 });
  }
}
