import client from './client.js';

// Wrappers for /api/v1/matches/* (matching-service).
//
// MatchSuggestion shape (from matching-service):
//   {
//     matchId:    UUID,
//     userId:     UUID            <-- the OTHER user (the candidate)
//     totalScore: number          0..1, weighted sum
//     breakdown: {
//       details: [
//         { name: 'skill-match', weight: 0.30, value: 0.95, explanation: 'Bilateral skill match' },
//         { name: 'jaccard',     weight: 0.20, value: 0.80, explanation: 'Jaccard A->B=0.85, B->A=0.75' },
//         ...
//       ]
//     },
//     theirOffers: [{ name: 'Java', tags: ['java','spring'] }, ...],   // can teach
//     theirWants:  [{ name: 'Python', tags: ['python','ml'] }, ...]    // wants to learn
//   }
//
// MatchResponse (returned by accept/decline):
//   {
//     id, userAId, userBId, status: 'PENDING'|'ACCEPTED'|'DECLINED'|'EXPIRED',
//     totalScore, breakdown, createdAt, expiresAt
//   }

export async function getSuggestions(userId, limit = 10) {
  const res = await client.get(`/matches/suggestions/${userId}`, { params: { limit } });
  return res.data;
}

export async function acceptMatch(matchId) {
  const res = await client.post(`/matches/${matchId}/accept`);
  return res.data;
}

export async function declineMatch(matchId) {
  const res = await client.post(`/matches/${matchId}/decline`);
  return res.data;
}
