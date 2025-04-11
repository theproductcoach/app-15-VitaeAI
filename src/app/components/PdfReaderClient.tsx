"use client";

import { useEffect, useState } from "react";
import * as PDFJS from "pdfjs-dist";
import { loadPdfWorker } from "../utils/pdfWorkerLoader";
import { TextItem } from "pdfjs-dist/types/src/display/api";

interface PdfReaderClientProps {
  file: File;
  onTextExtracted: (text: string) => void;
  onError?: (error: Error) => void;
}

export default function PdfReaderClient({
  file,
  onTextExtracted,
  onError,
}: PdfReaderClientProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let isSubscribed = true;

    const setupAndProcess = async () => {
      setIsProcessing(true);

      try {
        // Load and assign the blob worker
        if (typeof window !== "undefined") {
          const blobUrl = await loadPdfWorker();
          PDFJS.GlobalWorkerOptions.workerSrc = blobUrl;
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFJS.getDocument({ data: arrayBuffer }).promise;

        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item) => (item as TextItem).str || "")
            .join(" ");
          fullText += pageText + "\n";
        }

        if (isSubscribed) {
          onTextExtracted(fullText.trim());
        }
      } catch (error) {
        console.error("Error processing PDF:", error);
        if (isSubscribed && onError) {
          onError(
            error instanceof Error ? error : new Error("Failed to process PDF")
          );
        }
      } finally {
        if (isSubscribed) {
          setIsProcessing(false);
        }
      }
    };

    if (file) {
      setupAndProcess();
    }

    return () => {
      isSubscribed = false;
    };
  }, [file, onTextExtracted, onError]);

  return (
    <div className="mt-4">
      {isProcessing && (
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          Processing PDF...
        </div>
      )}
    </div>
  );
}
