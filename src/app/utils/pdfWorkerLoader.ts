export async function loadPdfWorker(): Promise<string> {
    if (typeof window === "undefined") return "";
    
    // Get the actual path to the worker
    const workerSrc = await import("pdfjs-dist/build/pdf.worker.js?url");
  
    // Return the path directly — no Blob needed
    return workerSrc.default;
  }
  