// UploadPage.tsx

"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "../components/Navbar";
import { extractTextFromFile } from "../utils/fileProcessing";
import ReactMarkdown from "react-markdown";

const PdfReaderClient = dynamic(
  () => import("@/app/components/PdfReaderClient"),
  { ssr: false }
);

interface GeneratedContent {
  coverLetter: string;
  revisedResume: string;
}

export default function UploadPage() {
  const [dragActive, setDragActive] = useState({ resume: false });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedContent, setGeneratedContent] =
    useState<GeneratedContent | null>(null);

  const handleReset = () => {
    setResumeFile(null);
    setResumeText("");
    setJobDescription("");
    setError(null);
    setGeneratedContent(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive({ resume: true });
    } else if (e.type === "dragleave") {
      setDragActive({ resume: false });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive({ resume: false });
    setError(null);

    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFileType(file)) {
        setResumeFile(file);
        setResumeText("");
      } else {
        setError("Please upload a PDF, DOCX, or TXT file.");
      }
    }
  };

  const validateFileType = (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    return validTypes.includes(file.type);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (file && validateFileType(file)) {
      setResumeFile(file);
      setResumeText("");
    } else {
      setError("Please upload a PDF, DOCX, or TXT file.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);
    setGeneratedContent(null);

    try {
      if (!resumeFile || !jobDescription.trim()) {
        throw new Error("Please provide both a resume and job description.");
      }

      if (resumeFile.type !== "application/pdf") {
        const extractedText = await extractTextFromFile(resumeFile);
        setResumeText(extractedText);
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescriptionText: jobDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate content");
      }

      const data = await response.json();
      console.log("Generated content:", data);
      setGeneratedContent(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const UploadBox = () => (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload Your Resume
      </label>
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 ${
          dragActive.resume
            ? "border-blue-500 bg-blue-50"
            : resumeFile
            ? "border-green-500 bg-green-50"
            : "border-gray-300 hover:border-gray-400"
        } transition-colors duration-200`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
          accept=".pdf,.doc,.docx,.txt"
        />
        <div className="text-center">
          <div className="text-gray-600">
            {resumeFile ? (
              <span className="text-green-600">{resumeFile.name}</span>
            ) : (
              <>
                <span className="font-medium">Drop your file here</span>
                <span className="text-gray-500"> or click to upload</span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Supports PDF, DOCX, and TXT files
          </p>
        </div>
      </div>
      {resumeFile?.type === "application/pdf" && (
        <PdfReaderClient
          file={resumeFile}
          onTextExtracted={setResumeText}
          onError={(error) => setError(error.message)}
        />
      )}
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto py-12">
          <div className="bg-white p-8 rounded-xl shadow-sm mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">
              Upload Your Documents
            </h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <UploadBox />

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="w-full">
                <label
                  htmlFor="jobDescription"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Job Description
                </label>
                <textarea
                  id="jobDescription"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                {(resumeFile || jobDescription || generatedContent) && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-2 rounded-lg text-gray-700 font-medium border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="submit"
                  disabled={
                    isProcessing || !resumeFile || !jobDescription.trim()
                  }
                  className={`px-6 py-2 rounded-lg text-white font-medium ${
                    isProcessing || !resumeFile || !jobDescription.trim()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } transition-colors duration-200`}
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    "Process Documents"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Render generated content using ReactMarkdown */}
          {generatedContent && (
            <div className="space-y-8">
              {/* Cover Letter Section */}
              <div className="bg-white p-8 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold text-black mb-4">
                  Generated Cover Letter
                </h2>
                <div className="prose text-black prose-headings:text-black prose-headings:font-semibold prose-p:text-black prose-p:leading-relaxed prose-p:mb-8 [&>p]:mb-8 prose-ul:text-black prose-li:my-1 prose-strong:text-black prose-strong:font-semibold prose-a:text-black max-w-none space-y-8">
                  <ReactMarkdown>{generatedContent.coverLetter}</ReactMarkdown>
                </div>
              </div>

              {/* CV Improvement Suggestions Section */}
              {generatedContent.revisedResume && (
                <div className="bg-white p-8 rounded-xl shadow-sm">
                  <h2 className="text-xl font-semibold text-black mb-4">
                    CV Improvement Suggestions
                  </h2>
                  <div className="prose text-black prose-headings:text-black prose-headings:font-semibold prose-p:text-black prose-p:leading-relaxed prose-p:mb-8 [&>p]:mb-8 prose-ul:text-black prose-ul:mt-4 prose-li:my-1 prose-strong:text-black prose-strong:font-semibold prose-a:text-black prose-ol:text-black prose-ol:mt-6 prose-ol:space-y-6 [&>ol>li]:mb-6 max-w-none space-y-8">
                    <ReactMarkdown>
                      {generatedContent.revisedResume.split(
                        "[START CV FEEDBACK]"
                      )[1] || generatedContent.revisedResume}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
