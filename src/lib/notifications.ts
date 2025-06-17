import { StudyClubModel } from '@/src/model/StudyClub';

// Store active SSE connections
const clients = new Map<string, ReadableStreamDefaultController>();

// Helper function to send notifications to all clients for a specific club
export async function sendNotification(partyCode: string, type: string, data: any) {
  const message = JSON.stringify({ type, data });
  const controller = clients.get(partyCode);
  if (controller) {
    controller.enqueue(new TextEncoder().encode(`data: ${message}\n\n`));
  }
}

// Helper function to send member updates
export async function sendMemberUpdate(partyCode: string) {
  const club = await StudyClubModel.findOne({ partyCode })
    .populate('members', 'username email')
    .populate('pendingRequests', 'username email');
  
  if (club) {
    sendNotification(partyCode, 'member-update', {
      members: club.members,
      pendingRequests: club.pendingRequests,
      stats: {
        membersCount: club.members.length,
        pendingRequestsCount: club.pendingRequests.length
      }
    });
  }
}

// Helper function to send request status updates
export async function sendRequestStatus(partyCode: string, userId: string, status: 'approved' | 'rejected') {
  sendNotification(partyCode, 'request-status', { userId, status });
}

// Helper function to send club dismissal notification
export async function sendClubDismissed(partyCode: string) {
  sendNotification(partyCode, 'club-dismissed', { partyCode });
}

// Helper function to send new join request notification
export async function sendNewJoinRequest(partyCode: string, username: string, email: string) {
  sendNotification(partyCode, 'new-join-request', { username, email });
}

// Helper function to send member kicked notification
export async function sendMemberKicked(partyCode: string, userId: string) {
  sendNotification(partyCode, 'member-kicked', { userId });
}

// Helper function to send admin transfer notification
export async function sendAdminTransfer(partyCode: string, newAdminId: string) {
  sendNotification(partyCode, 'admin-transfer', { newAdminId });
}

// Helper function to register a new client
export function registerClient(partyCode: string, controller: ReadableStreamDefaultController) {
  clients.set(partyCode, controller);
}

// Helper function to unregister a client
export function unregisterClient(partyCode: string) {
  clients.delete(partyCode);
}
