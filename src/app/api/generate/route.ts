import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { resumeText, jobDescriptionText } = await request.json();

    if (!resumeText || !jobDescriptionText) {
      return NextResponse.json(
        { error: 'Resume and job description are required' },
        { status: 400 }
      );
    }

    // Truncate long texts to prevent context length errors
    const truncateText = (text: string, maxLength: number = 6000): string => {
      if (text.length > maxLength) {
        return text.substring(0, 5000) + "... [truncated]";
      }
      return text;
    };

    const truncatedResume = truncateText(resumeText);
    const truncatedJobDesc = truncateText(jobDescriptionText);

    const systemPrompt = `You are an expert career coach and professional resume writer with extensive experience in tailoring resumes and writing compelling cover letters. 
Your task is to help job seekers by:
1. Creating a persuasive cover letter that connects their experience to the job requirements
2. Suggesting strategic improvements to their resume to better align with the job description

Format your responses in clear sections using markdown.`;

    const userPrompt = `Please help tailor the following resume to the job description and create a compelling cover letter.

Job Description:
${truncatedJobDesc}

Current Resume:
${truncatedResume}

Your response must be formatted using the following delimiters exactly:

[START COVER LETTER]
Your markdown-formatted cover letter here
[END COVER LETTER]

[START REVISED RESUME]
Your markdown-formatted revised resume here
[END REVISED RESUME]

Guidelines for each section:

1. The Cover Letter should:
- Open with a strong hook, but keep the tone human and conversational
- Mention specific relevant experience
- Show alignment with the job/company
- End with a clear, warm call to action

2. The Revised Resume should:
- Use markdown formatting with headings, bullet points, bold roles etc.
- Reorder and reword entries to better match the job description
- Emphasise keywords and quantifiable impact

Please output both sections using only markdown.`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2500,
      });

      const fullResponse = completion.choices[0].message.content || '';
      console.log("Raw GPT response:", fullResponse);

      const coverLetterMatch = fullResponse.match(/\[START COVER LETTER\]([\s\S]*?)\[END COVER LETTER\]/);
      const resumeMatch = fullResponse.match(/\[START REVISED RESUME\]([\s\S]*?)\[END REVISED RESUME\]/);

      const coverLetter = coverLetterMatch?.[1]?.trim() || '';
      const revisedResume = resumeMatch?.[1]?.trim() || '';

      return NextResponse.json({
        coverLetter,
        revisedResume,
      });
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'An unexpected error occurred with the OpenAI API' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
}
