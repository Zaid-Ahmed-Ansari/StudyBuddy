'use client'

import { useState, useCallback } from "react";
import { Upload, FileText, X } from "lucide-react";

export default function FileInput({
  onFilesSelect,
}: {
  onFilesSelect: (files: File[]) => void;
}) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = (files: File[]) => {
    const allowedFiles = files.filter(file =>
      ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type)
    );

    const newFiles = [...selectedFiles, ...allowedFiles].filter(
      (file, index, self) => index === self.findIndex(f => f.name === file.name)
    );

    setSelectedFiles(newFiles);
    onFilesSelect(newFiles);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files || []);
    processFiles(files);
  }, [selectedFiles]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (fileName: string) => {
    const updatedFiles = selectedFiles.filter(file => file.name !== fileName);
    setSelectedFiles(updatedFiles);
    onFilesSelect(updatedFiles);
  };

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragging ? 'border-accent/70 bg-accent' : 'border-gray-300 hover:border-accent/50 hover:bg-accent/70'}
        `}
        onClick={() => document.getElementById("multi-file-upload")?.click()}
      >
        <Upload className="h-8 w-8 text-accent/60 mb-2" />
        <p className="text-sm text-gray-700 font-medium">
          Click or drag files to upload
        </p>
        <p className="text-xs text-gray-500">
          Supports PDF & DOCX formats (Multiple files allowed)
        </p>
        <input
          id="multi-file-upload"
          type="file"
          accept=".pdf,.docx"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {selectedFiles.length > 0 && (
        <ul className="mt-4 space-y-2 max-h-60 overflow-y-auto">
          {selectedFiles.map((file) => (
            <li
              key={file.name}
              className="flex items-center justify-between bg-gray-100 border border-gray-300 rounded px-4 py-2 text-sm"
            >
              <div className="flex items-center gap-2 truncate text-gray-700">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="truncate max-w-xs">{file.name}</span>
              </div>
              <button onClick={() => removeFile(file.name)} className="ml-2">
                <X className="h-4 w-4 text-gray-500 hover:text-red-600 transition-colors" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
