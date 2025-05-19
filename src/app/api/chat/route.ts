import { rateLimit } from '@/src/lib/rate-limit';

import { NextResponse } from 'next/server';
import {GoogleGenAI} from '@google/genai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const ai = new GoogleGenAI({apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY});
  const { prompt } = await req.json();
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const limitCheck = rateLimit(ip.toString(), 10, 60 * 1000); // 10 reqs per minute

  if (!limitCheck.success) {
    return new NextResponse(
      JSON.stringify({ message: 'Too many requests. Please try again later.' }),
      { status: 429 }
    );
  }

  try {
    const  {text}  = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: `Please answer only educational queries related to studying or academic topics.Also you can reply to greetings and can talk casually like you are thier studybuddy.If the topic is not about education or academics then just politely say "Your question is not about study". The user's query: ${prompt}`,
      
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
