import client from './client.js';

// Wrappers for /api/v1/users/* (user-service).
//
// ProfileResponse shape:
//   {
//     userId, displayName, bio, avatarUrl,
//     timezone, language, location,
//     rating: BigDecimal (0..5),
//     createdAt, updatedAt
//   }
//
// Note: a freshly-registered user might not have a profile yet — the
// `user.registered` event takes a moment to process. Callers should
// gracefully handle 404 / null.

export async function getProfile(userId) {
  const res = await client.get(`/users/${userId}`);
  return res.data;
}

// PUT replaces the whole profile. Backend body shape (UpdateProfileRequest):
//   { displayName, bio, avatarUrl, timezone, language, location }
export async function updateProfile(userId, payload) {
  const res = await client.put(`/users/${userId}`, payload);
  return res.data;
}

// PATCH on preferences. Body (PreferenceUpdateRequest):
//   { preferredLanguages: string[], preferredTimezoneRange, availabilitySchedule }
// availabilitySchedule is a JSON string like {"MON":[{"from":9,"to":17}]}.
export async function updatePreferences(userId, payload) {
  const res = await client.patch(`/users/${userId}/preferences`, payload);
  return res.data;
}

// Read-only counterpart to updatePreferences. Used by the schedule-session
// calendar to know when the OTHER user marked themselves available.
// Returns PreferenceResponse:
//   { id, userId, preferredLanguages, preferredTimezoneRange, availabilitySchedule }
export async function getPreferences(userId) {
  const res = await client.get(`/users/${userId}/preferences`);
  return res.data;
}

// Convenience: fetch many profiles in parallel; missing ones become null
// instead of throwing, so the UI can render a fallback for that row.
export async function getProfiles(userIds) {
  const settled = await Promise.allSettled(userIds.map((id) => getProfile(id)));
  return settled.map((r) => (r.status === 'fulfilled' ? r.value : null));
}

// Case-insensitive partial name search — returns up to 20 matching profiles.
export async function searchByName(name) {
  const res = await client.get('/users/search', { params: { name } });
  return res.data;
}
