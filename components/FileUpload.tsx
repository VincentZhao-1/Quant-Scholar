import React, { useState } from 'react';
import { UploadIcon, FileTextIcon } from './Icons';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isAnalyzing: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isAnalyzing }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-20">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-serif font-bold text-academic-900 mb-4">QuantScholar</h1>
        <p className="text-academic-600 text-lg">
          Upload your literature (PDF). Build your academic intuition.
        </p>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-xl p-10 transition-all duration-200 ease-in-out flex flex-col items-center justify-center bg-white shadow-sm ${
          dragActive ? "border-academic-500 bg-academic-50" : "border-academic-200"
        } ${isAnalyzing ? "opacity-50 pointer-events-none" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleChange}
          accept="application/pdf"
          disabled={isAnalyzing}
        />
        
        {isAnalyzing ? (
          <div className="flex flex-col items-center animate-pulse">
            <div className="h-12 w-12 bg-academic-200 rounded-full mb-4"></div>
            <p className="text-academic-600 font-medium">Deconstructing Paper...</p>
            <p className="text-academic-400 text-sm mt-1">Analyzing model mechanics</p>
          </div>
        ) : (
          <>
            <div className="bg-academic-50 p-4 rounded-full mb-4">
              <UploadIcon className="w-8 h-8 text-academic-600" />
            </div>
            <p className="text-lg font-medium text-academic-800 mb-2">
              Drop your PDF here, or click to browse
            </p>
            <p className="text-sm text-academic-400">
              Supports standard academic PDFs
            </p>
          </>
        )}
      </div>
      
      <div className="mt-8 grid grid-cols-3 gap-4 text-center text-sm text-academic-500">
        <div className="flex flex-col items-center">
            <FileTextIcon className="w-6 h-6 mb-2 text-academic-400" />
            <span>Structure Extraction</span>
        </div>
        <div className="flex flex-col items-center">
            <div className="w-6 h-6 mb-2 text-academic-400 font-serif font-bold text-xl">∑</div>
            <span>Model Breakdown</span>
        </div>
         <div className="flex flex-col items-center">
            <div className="w-6 h-6 mb-2 text-academic-400 font-bold text-xl">?</div>
            <span>Deep Q&A</span>
        </div>
      </div>
    </div>
  );
};
