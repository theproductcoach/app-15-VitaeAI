'use client';

import mammoth from 'mammoth';

export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;

  try {
    // Handle DOCX files
    if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }

    // Handle plain text files
    if (fileType === 'text/plain') {
      const text = await file.text();
      return text;
    }

    throw new Error('Unsupported file type. Please upload a DOCX or TXT file.');
  } catch (error) {
    console.error('Error processing file:', error);
    throw new Error('Failed to process file. Please try again.');
  }
} 