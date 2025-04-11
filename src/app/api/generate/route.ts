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
    // Each text is limited to 6000 chars (~1500 tokens) to ensure total stays within model limits
    const truncateText = (text: string, maxLength: number = 6000): string => {
      if (text.length > maxLength) {
        return text.substring(0, 5000) + "... [truncated]";
      }
      return text;
    };

    const truncatedResume = truncateText(resumeText);
    const truncatedJobDesc = truncateText(jobDescriptionText);

    // System prompt for consistent formatting and high-quality outputs
    const systemPrompt = `You are an expert career coach and professional resume writer with extensive experience in tailoring resumes and writing compelling cover letters. 
Your task is to help job seekers by:
1. Creating a persuasive cover letter that connects their experience to the job requirements
2. Suggesting strategic improvements to their resume to better align with the job description

Format your responses in clear sections using markdown.`;

    // User prompt with specific instructions for both outputs
    const userPrompt = `Please help tailor the following resume to the job description and create a compelling cover letter.

Job Description:
${truncatedJobDesc}

Current Resume:
${truncatedResume}

Please provide two separate outputs:

1. A tailored cover letter that:
- Opens with a strong hook
- Connects specific experiences from the resume to key job requirements
- Demonstrates enthusiasm and cultural fit
- Closes with a clear call to action

2. A revised version of the resume that:
- Reorders and rephrases points to better match job requirements
- Uses relevant keywords from the job description
- Quantifies achievements where possible
- Maintains all truthful information from the original resume

Format both outputs in markdown.`;

    try {
      // Make the API call to OpenAI
      const completion = await openai.chat.completions.create({
        model: 'gpt-4', // Fallback to gpt-3.5-turbo if gpt-4 is not available
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7, // Balance between creativity and consistency
        max_tokens: 2500, // Adjust based on your needs
      });

      // Extract and split the response into cover letter and resume
      const fullResponse = completion.choices[0].message.content || '';
      
      // Split the response into sections (assuming markdown formatting)
      const sections = fullResponse.split(/(?=\d\. )/); // Split on numbered sections
      const coverLetter = sections[1]?.replace('1. ', '').trim() || '';
      const revisedResume = sections[2]?.replace('2. ', '').trim() || '';

      return NextResponse.json({
        coverLetter,
        revisedResume,
      });
    } catch (error) {
      // Log the full error for debugging
      console.error('OpenAI API Error:', error);
      
      // Return the actual error message
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'An unexpected error occurred with the OpenAI API' },
        { status: 500 }
      );
    }
  } catch (error) {
    // Log outer errors (parsing, validation, etc)
    console.error('Request processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
} 