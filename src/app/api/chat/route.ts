import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  try {
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      prompt: `Please answer only educational queries related to studying or academic topics.Also you can reply to greetings and can talk casually like you are thier studybuddy.If the topic is not about education or academics then just politely say "Your question is not about study". The user's query: ${prompt}`,
      
    });

    return NextResponse.json({ text });
  } catch (err) {
    console.error(err);
    return Response.json(
      { success: false,
        message: "Something" 
       },
      
      { status: 400 });
  }
}
