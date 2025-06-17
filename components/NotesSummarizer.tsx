'use client';

import { useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import * as mammoth from "mammoth";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import FileInput from "@/components/FileInput";
import { toast } from "sonner";
import { createWorker } from "tesseract.js";
import { 
  FileText, 
  Upload, 
  AlignLeft, 
  FileType2, 
  Clock, 
  Save, 
  Loader2,
  ChevronDown,
  NotebookText
} from "lucide-react";

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
  const [summaryExpanded, setSummaryExpanded] = useState(true);

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

        setProgressText(`Processing page ${i} of ${totalPages}`);
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
      setSummaryExpanded(true);
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
      toast.success("Saved Successfully. Visit your dashboard to see it.");
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save summary.");
    }
  };

  return (
    <main className="min-h-screen flex justify-center py-14 px-4">
      <div className="w-full max-w-2xl">
        <div className="bg-card text-card-foreground rounded-2xl shadow-lg border border-accent/10 overflow-hidden">
          {/* Header */}
          <div className="bg-accent/5 px-6 py-5 border-b border-accent/10">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2 text-accent">
              <NotebookText className="w-7 h-7" />
              <span>Notes Summarizer</span>
            </h1>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {/* Input Mode Selector */}
            <div className="flex justify-center gap-3 mb-6 bg-muted/30 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setInputMode("pdf")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-medium text-sm flex-1 justify-center transition-all duration-200 ${
                  inputMode === "pdf"
                    ? "bg-accent text-white shadow-md"
                    : "hover:bg-muted"
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload Files
              </button>
              <button
                type="button"
                onClick={() => setInputMode("text")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-medium text-sm flex-1 justify-center transition-all duration-200 ${
                  inputMode === "text"
                    ? "bg-accent text-white shadow-md"
                    : "hover:bg-muted"
                }`}
              >
                <AlignLeft className="w-4 h-4" />
                Manual Text
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Input Area */}
              <div className="rounded-lg border border-input bg-background">
                {inputMode === "pdf" && (
                  <div className="p-1">
                    <FileInput onFilesSelect={setFiles} />
                  </div>
                )}
                {inputMode === "text" && (
                  <textarea
                    rows={8}
                    placeholder="Paste or type your notes here..."
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    className="w-full p-4 rounded-lg bg-transparent focus:outline-none focus:ring-0 resize-none"
                  />
                )}
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm flex items-start">
                  <span className="mr-2 mt-0.5">⚠️</span>
                  {error}
                </div>
              )}
              
              {/* Progress Bar */}
              {loading && (
                <div className="w-full bg-muted/30 p-4 rounded-lg border border-accent/10 animate-pulse">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-accent flex items-center gap-1.5">
                      <FileType2 className="w-4 h-4" />
                      {progressText}
                    </p>
                    {estimatedTime !== null && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {estimatedTime}s remaining
                      </p>
                    )}
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all duration-300 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 text-right">
                    {progressPercent}% complete
                  </div>
                </div>
              )}
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent hover:bg-accent/90 text-white font-medium py-3 px-4 rounded-md disabled:opacity-50 shadow-md transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Summarizing...
                  </>
                ) : (
                  "Summarize Notes"
                )}
              </button>
            </form>

            {/* Summary Results */}
            {summary && (
              <div className="mt-8 animate-fadeIn">
                <div 
                  className="flex items-center justify-between bg-accent/5 rounded-t-lg p-3 border border-accent/10 cursor-pointer"
                  onClick={() => setSummaryExpanded(!summaryExpanded)}
                >
                  <h2 className="text-lg font-semibold text-accent flex items-center gap-2">
                    <FileText className="w-5 h-5" /> 
                    Summary Results
                  </h2>
                  <button className="text-muted-foreground hover:text-foreground">
                    <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${summaryExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                
                {summaryExpanded && (
                  <div className="border border-t-0 border-accent/10 rounded-b-lg p-5 bg-white/5">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{summary}</ReactMarkdown>
                    </div>
                    
                    <div className="mt-5 pt-4 border-t border-accent/10 flex justify-end">
                      <button
                        onClick={() => handleSave(summary)}
                        className="flex items-center gap-2 px-4 py-2 rounded-md bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all duration-200"
                      >
                        <Save className="w-4 h-4" />
                        Save to Dashboard
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-4 text-center text-xs text-muted-foreground">
          Supports PDF, DOC, and DOCX files with OCR capabilities
        </div>
      </div>
    </main>
  );
} 