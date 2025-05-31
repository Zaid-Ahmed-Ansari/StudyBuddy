// // app/api/chat/[userId]/[chatId]/ai-response/route.js
// import { NextResponse } from 'next/server';

// import { GoogleGenAI } from "@google/genai";
// import dbConnect from '@/src/lib/dbConnect';
// import Chat from '@/src/model/Chat';

// // Rate limiting utility (implement based on your needs)
// function rateLimit(ip, maxRequests = 10, windowMs = 60000) {
//   // Simple in-memory rate limiting - you may want to use Redis for production
//   const now = Date.now();
//   const key = `rate_limit_${ip}`;
  
//   if (typeof global[key] === 'undefined') {
//     global[key] = { count: 0, resetTime: now + windowMs };
//   }
  
//   if (now > global[key].resetTime) {
//     global[key] = { count: 0, resetTime: now + windowMs };
//   }
  
//   global[key].count++;
  
//   return {
//     success: global[key].count <= maxRequests,
//     remaining: Math.max(0, maxRequests - global[key].count)
//   };
// }

// export const runtime = "edge";

// export async function POST(request, { params }) {
//   try {
//     await dbConnect();
    
//     const { userId, chatId } = params;
//     const { prompt } = await request.json();
    
//     // Validate required parameters
//     if (!userId || !chatId) {
//       return NextResponse.json(
//         { success: false, message: 'User ID and Chat ID are required' },
//         { status: 400 }
//       );
//     }

//     if (!prompt || !prompt.trim()) {
//       return NextResponse.json(
//         { success: false, message: 'Prompt is required' },
//         { status: 400 }
//       );
//     }

//     // Rate limiting
//     const ip = request.headers.get("x-forwarded-for") || 
//                request.headers.get("x-real-ip") || 
//                "unknown";
//     const limitCheck = rateLimit(ip.toString(), 10, 60 * 1000); // 10 reqs/min

//     if (!limitCheck.success) {
//       return NextResponse.json(
//         { success: false, message: "Too many requests. Please try again later." },
//         { status: 429 }
//       );
//     }

//     // Find the chat
//     const chat = await Chat.findOne({ _id: chatId, userId });
    
//     if (!chat) {
//       return NextResponse.json(
//         { success: false, message: 'Chat not found' },
//         { status: 404 }
//       );
//     }

//     // Add user message to chat
//     const userMessage = {
//       text: prompt.trim(),
//       isUser: true,
//       timestamp: new Date()
//     };
    
//     chat.messages.push(userMessage);

//     // Initialize Google AI
//     const ai = new GoogleGenAI({
//       apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
//     });

//     if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
//       throw new Error('Google Generative AI API key not configured');
//     }

//     // Prepare the AI prompt with context
//     const systemPrompt = `You are StudyBuddy, a knowledgeable and supportive educational assistant designed to help with academic questions across all subjects. You maintain a friendly, professional tone while focusing exclusively on educational content.

// RESPONSE GUIDELINES:
// 1. Answer only educational or academic questions, including casual greetings in an educational context.
// 2. For non-educational topics, politely decline with: "I'm focused on helping with educational topics. How can I assist with your studies instead?"
// 3. Don't explain in too many words.

// SUBJECT-SPECIFIC FORMATTING:

// CODE QUESTIONS:
// - Format all code in Markdown code blocks with appropriate language tags (\`\`\`python, \`\`\`javascript, etc.)
// - Include proper indentation, meaningful variable names, and clear comments
// - Explain key concepts and logic when providing code solutions
// - Test code examples mentally before sharing to ensure they work as expected

// MATHEMATICS:
// - Use appropriate mathematical notation and formatting
// - Show step-by-step solutions for complex problems
// - Explain each step clearly, highlighting important concepts
// - Include visual representations or diagrams when helpful

// WRITING/HUMANITIES:
// - Provide clear, concise explanations of concepts
// - Include relevant examples, quotes, or references when appropriate
// - Offer structured formatting for essays or written responses

// SCIENTIFIC SUBJECTS:
// - Present information with appropriate scientific terminology
// - Include relevant formulas, theories, and experimental context
// - Explain complex concepts with accessible analogies when helpful

// GENERAL FEATURES:
// - Provide concise answers that directly address the question
// - Include examples only when they clarify understanding
// - Cite reputable sources when appropriate
// - Avoid unnecessary advice beyond what was specifically requested
// - Respond to religion-based academic questions factually without bias

// Always prioritize accuracy and educational value in your responses.

// User's prompt: ${prompt}`;

//     // Generate AI response stream
//     const stream = await ai.models.generateContentStream({
//       model: "gemini-2.0-flash-001",
//       contents: systemPrompt,
//     });

//     // Collect the full response for saving to database
//     let fullResponse = '';
//     const encoder = new TextEncoder();
    
//     const readable = new ReadableStream({
//       async start(controller) {
//         try {
//           for await (const chunk of stream) {
//             if (chunk.text) {
//               fullResponse += chunk.text;
//               controller.enqueue(encoder.encode(chunk.text));
//             }
//           }
          
//           // Save the complete AI response to the database
//           const aiMessage = {
//             text: fullResponse,
//             isUser: false,
//             timestamp: new Date()
//           };
          
//           chat.messages.push(aiMessage);
//           await chat.save();
          
//           controller.close();
//         } catch (err) {
//           console.error('Streaming error:', err);
//           controller.error(err);
//         }
//       },
//     });

//     return new Response(readable, {
//       headers: {
//         "Content-Type": "text/plain; charset=utf-8",
//         "Cache-Control": "no-cache",
//         "Transfer-Encoding": "chunked",
//       },
//     });

//   } catch (error) {
//     console.error('Error generating AI response:', error);
    
//     // Return appropriate error response
//     if (error.message.includes('API key')) {
//       return NextResponse.json(
//         { success: false, message: 'AI service configuration error' },
//         { status: 500 }
//       );
//     }
    
//     return NextResponse.json(
//       { success: false, message: 'Failed to generate AI response' },
//       { status: 500 }
//     );
//   }
// }

// // Optional: Add a GET method to retrieve chat messages
// export async function GET(request, { params }) {
//   try {
//     await dbConnect();
    
//     const { userId, chatId } = params;
    
//     if (!userId || !chatId) {
//       return NextResponse.json(
//         { success: false, message: 'User ID and Chat ID are required' },
//         { status: 400 }
//       );
//     }

//     const chat = await Chat.findOne({ _id: chatId, userId })
//       .select('messages')
//       .lean();
    
//     if (!chat) {
//       return NextResponse.json(
//         { success: false, message: 'Chat not found' },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       messages: chat.messages
//     });

//   } catch (error) {
//     console.error('Error fetching messages:', error);
//     return NextResponse.json(
//       { success: false, message: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }