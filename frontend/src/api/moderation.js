import client from './client.js';

// Reports ─────────────────────────────────────────────────────────────────
// status: 'OPEN' | 'RESOLVED' | 'DISMISSED' | undefined (= all)
export async function getReports(status) {
  const params = status ? { status } : {};
  const res = await client.get('/moderation/reports', { params });
  return res.data; // ContentReport[]
}

export async function resolveReport(id) {
  const res = await client.post(`/moderation/reports/${id}/resolve`);
  return res.data;
}

export async function dismissReport(id) {
  const res = await client.post(`/moderation/reports/${id}/dismiss`);
  return res.data;
}

// Sanctions ───────────────────────────────────────────────────────────────
export async function getUserSanctions(userId) {
  const res = await client.get(`/moderation/users/${userId}/sanctions`);
  return res.data; // SanctionResponse[]
}

// data: { userId, type, reason, expiresAt? }
// type: 'WARNING' | 'TEMP_BAN' | 'PERMANENT_BAN'
// expiresAt: ISO-8601 string, required only for TEMP_BAN
export async function createSanction(data) {
  const res = await client.post('/moderation/sanctions', data);
  return res.data;
}

export async function liftSanction(sanctionId) {
  const res = await client.delete(`/moderation/sanctions/${sanctionId}`);
  return res.data;
}

// Content management ──────────────────────────────────────────────────────
export async function deleteSkill(skillId) {
  await client.delete(`/moderation/skills/${skillId}`);
}

// data: { displayName?, bio? }
export async function moderatorPatchProfile(userId, data) {
  await client.patch(`/moderation/users/${userId}/profile`, data);
}
