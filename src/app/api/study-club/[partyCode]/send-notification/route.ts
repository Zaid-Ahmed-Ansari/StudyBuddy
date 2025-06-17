import { NextRequest, NextResponse } from 'next/server';
import {
  sendNotification,
  sendMemberUpdate,
  sendRequestStatus,
  sendClubDismissed,
  sendNewJoinRequest,
  sendMemberKicked,
  sendAdminTransfer,
  registerClient,
  unregisterClient
} from '@/src/lib/notifications';

export async function GET(req: NextRequest, context: { params: Promise<{ partyCode: string }> }) {
  const { partyCode } = await context.params;

  const stream = new ReadableStream({
    start(controller) {
      registerClient(partyCode, controller);
      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`));
    },
    cancel() {
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

export async function POST(req: NextRequest, context: { params: Promise<{ partyCode: string }> }) {
  const { partyCode } = await context.params;
  const { type, data } = await req.json();

  try {
    switch (type) {
      case 'request-status':
        await sendRequestStatus(partyCode, data.userId, data.status);
        break;
      case 'member-update':
        await sendMemberUpdate(partyCode);
        break;
      case 'club-dismissed':
        await sendClubDismissed(partyCode);
        break;
      case 'new-join-request':
        await sendNewJoinRequest(partyCode, data.username, data.email);
        break;
      case 'member-kicked':
        await sendMemberKicked(partyCode, data.userId);
        break;
      case 'admin-transfer':
        await sendAdminTransfer(partyCode, data.newAdminId);
        break;
      default:
        return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
