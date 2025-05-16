"use client";

import { useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import * as mammoth from "mammoth";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import FileInput from "@/components/FileInput";
import { toast } from "sonner";

// Set PDF.js worker
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.0.375/pdf.worker.min.mjs`;

export default function NotesSummarizer() {
  const [inputMode, setInputMode] = useState<"pdf" | "text">("pdf");
  const [files, setFiles] = useState<File[]>([]);
  const [manualText, setManualText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const extractTextFromFile = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await getDocument({ data: arrayBuffer }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(" ") + "\n\n";
      }
      return text;
    } else if (ext === "docx" || ext === "doc") {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }

    throw new Error("Unsupported file type.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSummary("");

    let inputText = "";

    if (inputMode === "pdf") {
      if (files.length === 0) {
        setError("Please upload at least one PDF, DOC, or DOCX file.");
        return;
      }

      setLoading(true);
      try {
        for (const file of files) {
          inputText += await extractTextFromFile(file);
          inputText += "\n\n";
        }
      } catch (err) {
        console.error(err);
        setError("Failed to extract text from one or more files.");
        setLoading(false);
        return;
      }
    } else {
      if (!manualText.trim()) {
        setError("Please enter some text to summarize.");
        return;
      }
      inputText = manualText;
      setLoading(true);
    }

    try {
      const res = await fetch("/api/summarizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      if (!res.ok) throw new Error("Failed to fetch summary");

      const data = await res.json();
      setSummary(data.text || "No summary returned.");
    } catch (e) {
      console.error(e);
      setError("Error generating summary.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (message: string) => {
    try {
      await axios.post(
        "/api/user/save",
        {
          content: message,
          contentType: "markdown",
          
          
        },
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  return (
    <main className="min-h-screen flex justify-center items-start py-10 px-4">
      <div className="w-full max-w-2xl border-2 shadow-xl rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-accent">
          Notes Summarizer
        </h1>

        <div className="flex justify-center gap-4 mb-6">
          <button
            type="button"
            onClick={() => setInputMode("pdf")}
            className={`px-4 py-2 rounded font-semibold border transition ${
              inputMode === "pdf"
                ? "bg-accent text-white"
                : "bg-white text-black border-accent/70"
            }`}
          >
            Upload Files
          </button>
          <button
            type="button"
            onClick={() => setInputMode("text")}
            className={`px-4 py-2 rounded font-semibold border transition ${
              inputMode === "text"
                ? "bg-accent text-white"
                : "bg-white text-black border-accent/70"
            }`}
          >
            Manual Text
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {inputMode === "pdf" && (
            <FileInput onFilesSelect={setFiles} />
          )}

          {inputMode === "text" && (
            <textarea
              rows={8}
              placeholder="Paste or type your notes here..."
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              className="w-full border rounded p-3 custom-scrollbar resize-none"
            />
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent/70 hover:cursor-pointer text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? "Summarizing..." : "Summarize"}
          </button>
        </form>

        {summary && (
          <section className="mt-8 p-4 text-white rounded-lg border border-gray-300 max-h-96 overflow-y-auto custom-scrollbar">
            <h2 className="text-xl font-semibold mb-3 ">Summary</h2>
            <hr className="mb-3" />
            <div className=" ">

            <ReactMarkdown>
              {summary}
            </ReactMarkdown>
            </div>

          </section>
        )}
            <button
  onClick={async () => {
    try {
      await handleSave(summary);
      toast.success("Saved Successfully. Visit your dashboard to see it.");
    } catch {
      toast.error("Failed to save summary.");
    }
  }}
  className="mt-4 text-sm px-3 py-1 rounded-md border border-accent/70 text-accent hover:bg-accent/60 hover:text-white transition-all"
>
  Save Summary
</button>
      </div>
    </main>
  );
}
