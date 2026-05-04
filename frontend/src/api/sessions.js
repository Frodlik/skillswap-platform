import client from './client.js';

// Wrappers for /api/v1/sessions/* (session-service).
//
// SessionResponse:
//   { id, matchId, teacherId, learnerId, skillName,
//     scheduledAt, durationTokens,
//     status: 'SCHEDULED'|'ACTIVE'|'COMPLETED'|'CANCELLED',
//     createdAt, completedAt }
//
// WalletBalanceResponse:    { userId, balance, heldBalance, total }
// TransactionResponse:      { id, walletId, amount,
//                             type: 'CREDIT'|'DEBIT'|'HOLD'|'RELEASE'|'TRANSFER',
//                             referenceId, description, createdAt }
// ReviewRequest:            { reviewerId, revieweeId, rating (1..5), comment }
//
// Spring Pageable responses come back as:
//   { content: [...], totalElements, totalPages, number, size, ... }
// Helpers below normalise to plain arrays (we don't expose paging in MVP).

export async function getUserSessions(userId, page = 0, size = 50) {
  const res = await client.get(`/sessions/user/${userId}`, { params: { page, size } });
  return res.data;          // Spring Page<SessionResponse>
}

export async function updateSessionStatus(sessionId, status) {
  const res = await client.patch(`/sessions/${sessionId}/status`, { status });
  return res.data;
}

export async function createSession(payload) {
  const res = await client.post('/sessions', payload);
  return res.data;
}

export async function submitReview(sessionId, payload) {
  const res = await client.post(`/sessions/${sessionId}/review`, payload);
  return res.data;
}

export async function getBalance(userId) {
  const res = await client.get(`/sessions/user/${userId}/balance`);
  return res.data;          // { balance, heldBalance, total }
}

export async function getTransactions(userId, page = 0, size = 50) {
  const res = await client.get(`/sessions/user/${userId}/transactions`, { params: { page, size } });
  return res.data;          // Spring Page<TransactionResponse>
}

// Returns { roomName, url } for a Jitsi Meet room.
// URL is deterministic (skillswap-{sessionId}) so both teacher and learner
// hitting this endpoint land in the same room.
export async function getRoom(sessionId) {
  const res = await client.get(`/sessions/${sessionId}/room`);
  return res.data;
}

// Trust & Safety: file a report against the OTHER participant of a session.
//
// Backend body shape (SubmitReportRequest):
//   { reporterId, reason, comment }
//
// `reason` must be one of:
//   HARASSMENT | HATE_SPEECH | INAPPROPRIATE | NO_SHOW | OFF_TOPIC | SCAM | OTHER
//
// Backend derives `reportedUserId` server-side (the participant who is NOT the
// reporter), so a malicious client cannot misattribute the report. Allowed only
// on sessions in COMPLETED or CANCELLED state — earlier statuses return 409.
// Duplicate report from the same reporter on the same session returns 409.
export async function submitReport(sessionId, payload) {
  const res = await client.post(`/sessions/${sessionId}/report`, payload);
  return res.data;
}
