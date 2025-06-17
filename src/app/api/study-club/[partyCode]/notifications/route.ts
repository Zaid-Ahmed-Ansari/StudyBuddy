import { NextRequest } from 'next/server';
import { registerClient, unregisterClient } from '@/src/lib/notifications';

export async function GET(req: NextRequest, context: { params: Promise<{ partyCode: string }> }) {
  const { partyCode } = await context.params;

  // Create a new stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Store the controller for this connection
      registerClient(partyCode, controller);

      // Send initial connection state
      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`));
    },
    cancel() {
      // Remove the controller when the connection is closed
      unregisterClient(partyCode);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
} 