import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const result = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: `You are an expert academic assistant. Read the following content carefully and generate a concise, well-organized summary in bullet points. Focus on extracting key concepts, important facts, and any chronological or logical structure in the material.

Format the summary clearly with headings if necessary, and ensure it's easy to review for study purposes. If the content includes definitions, terms, dates, or examples, include them briefly in the summary. Give the output in a markdown format.
Text to be summarized: ${text}`,
    });

    return Response.json({ text: result.text });
  } catch (err) {
    console.error("Summarization failed:", err);
    return Response.json({ error: "Summarization failed" }, { status: 500 });
  }
}
