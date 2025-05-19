"use client";

import { useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import * as mammoth from "mammoth";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import FileInput from "@/components/FileInput";
import { toast } from "sonner";
import { createWorker } from "tesseract.js";

// Set PDF.js worker
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.0.375/pdf.worker.min.mjs`;

export default function NotesSummarizer() {
  const [inputMode, setInputMode] = useState<"pdf" | "text">("pdf");
  const [files, setFiles] = useState<File[]>([]);
  const [manualText, setManualText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [error, setError] = useState("");

  const extractTextFromFile = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      let text = "";
      const worker = await createWorker("eng");

      const startTime = Date.now();

      for (let i = 1; i <= totalPages; i++) {
        const pageStart = Date.now();

        setProgressText(`Processing page ${i} of ${totalPages}...`);
        setProgressPercent(Math.round((i / totalPages) * 100));

        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(" ").trim();

        if (pageText) {
          text += pageText + "\n\n";
        } else {
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d")!;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: context, viewport }).promise;

          const dataUrl = canvas.toDataURL("image/png");
          const result = await worker.recognize(dataUrl);
          text += result.data.text + "\n\n";
        }

        const timeTaken = Date.now() - pageStart;
        const pagesLeft = totalPages - i;
        setEstimatedTime(Math.ceil((timeTaken * pagesLeft) / 1000)); // in seconds
      }

      await worker.terminate();
      return text;
    }

    if (ext === "docx" || ext === "doc") {
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
    setProgressText("");
    setProgressPercent(0);
    setEstimatedTime(null);

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
      setProgressText("");
      setProgressPercent(0);
      setEstimatedTime(null);
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
          {inputMode === "pdf" && <FileInput onFilesSelect={setFiles} />}
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
          {loading && (
            <div className="w-full mt-2">
              <p className="text-sm mb-1 text-accent font-medium">{progressText}</p>
              <div className="w-full h-3 bg-gray-200 rounded overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300 ease-in-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-xs text-gray-600 mt-1 text-center">
                {progressPercent}% complete
                {estimatedTime !== null && (
                  <span> — Est. {estimatedTime}s remaining</span>
                )}
              </div>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent/70 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? "Summarizing..." : "Summarize"}
          </button>
        </form>

        {summary && (
          <section className="mt-8 p-4 text-white rounded-lg border border-gray-300 max-h-96 overflow-y-auto custom-scrollbar">
            <h2 className="text-xl font-semibold mb-3">Summary</h2>
            <hr className="mb-3" />
            <div>
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          </section>
        )}

        {summary && (
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
        )}
      </div>
    </main>
  );
}
