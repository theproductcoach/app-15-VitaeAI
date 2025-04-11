import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialise OpenAI client
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
        return text.substring(0, 5000) + '... [truncated]';
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

Format your responses in clear sections using markdown.
Use double line breaks between paragraphs for better readability.
For lists and bullet points, add a line break before and after the list.`;

    // Updated user prompt with delimiter and recommendations instead of rewrites
    const userPrompt = `Please help tailor the following CV to the job description and write a compelling cover letter.

Job Description:
${truncatedJobDesc}

Current CV:
${truncatedResume}

Your response must use the following format and delimiters exactly:

[START COVER LETTER]
Your markdown-formatted cover letter here
[END COVER LETTER]

[START CV FEEDBACK]
Begin with a brief introduction paragraph.

Key recommendations:

1. First suggestion here...

2. Second suggestion here...

3. Third suggestion here...

(Continue with numbered suggestions, using double line breaks between each point)
[END CV FEEDBACK]

Cover Letter guidance:
- Be direct and warm, using natural British English
- Mention specific relevant experience
- Show alignment with the company or team culture
- Close with a clear, friendly call to action

CV Feedback guidance:
- Format each suggestion as a numbered point
- Add double line breaks between each point
- Start with a brief introduction
- Keep suggestions clear and actionable
- Focus on specific improvements that align with the job requirements`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2500,
      });

      const fullResponse = completion.choices[0].message.content || '';
      console.log('Raw GPT response:', fullResponse);

      let coverLetter = '';
      let revisedResume = '';

      const matchCover = fullResponse.match(/\[START COVER LETTER\]([\s\S]*?)\[END COVER LETTER\]/);
      const matchResume = fullResponse.match(/\[START CV FEEDBACK\]([\s\S]*?)\[END CV FEEDBACK\]/);

      if (matchCover) {
        coverLetter = matchCover[1].trim();
      }
      if (matchResume) {
        revisedResume = matchResume[1].trim();
      }

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
