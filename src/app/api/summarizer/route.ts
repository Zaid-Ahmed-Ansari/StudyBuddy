import { GoogleGenAI } from "@google/genai";

export const runtime = "edge";

export async function POST(req: Request) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
  });

  function cleanText(text: string): string {
    return text
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      .replace(/[ \t]+$/gm, "")
      .replace(/```(\w+)?\s*\n([\s\S]*?)\n```/g, (match, lang, code) => {
        const language = lang || "";
        const cleanCode = code.trim();
        return `\`\`\`${language}\n${cleanCode}\n\`\`\``;
      })
      .replace(
        /(^|[^`])`([^`\n]{1,50})`([^`]|$)/g,
        (match, before, content, after) => {
          const looksLikeCode = /[=(){}[\];<>+\-*\/]/.test(content);
          if (looksLikeCode) return match;
          return `${before}**${content.trim()}**${after}`;
        }
      );
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    let contents: any[] = [];

    if (contentType.includes("application/json")) {
      const { text } = await req.json();
      contents = [text];
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return new Response(JSON.stringify({ error: "No file uploaded" }), {
          status: 400,
        });
      }

      const mimeType = file.type;
      const arrayBuffer = await file.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString("base64");

      if (mimeType === "application/pdf") {
        contents = [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: base64Data,
            },
          },
        ];
      } else if (
        mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const text = await extractDocxText(arrayBuffer);
        contents = [text];
      } else {
        return new Response(JSON.stringify({ error: "Unsupported file type" }), {
          status: 400,
        });
      }
    } else {
      return new Response(JSON.stringify({ error: "Unsupported content type" }), {
        status: 400,
      });
    }

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite-preview-06-17",
      contents,
      config: {
        systemInstruction: `You are an expert academic assistant. Read the following content carefully and generate a concise, well-organized summary in bullet points. Focus on extracting key concepts, important facts, and any chronological or logical structure in the material.

Format the summary clearly with headings if necessary, and ensure it's easy to review for study purposes. If the content includes definitions, terms, dates, or examples, include them briefly in the summary. Give the output in a markdown format.
Text to be summarized is in the prompt.`,
      },
    });

    const cleanedText = cleanText(result.text);
    return Response.json({ text: cleanedText });
  } catch (err) {
    console.error("Summarization failed:", err);
    return Response.json({ error: "Summarization failed" }, { status: 500 });
  }
}

// Optional: for extracting DOCX text without mammoth on edge runtime
async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(buffer);

  const documentXml = zip.file("word/document.xml");
  if (!documentXml) return "";

  const xmlText = await documentXml.async("text");
  const plainText = xmlText
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plainText;
}
