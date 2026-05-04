import client from './client.js';

// Wrappers for /api/v1/skills/* (skill-service).
//
// SkillCreateRequest body:
//   { name, categoryId, level (1..5), type: 'OFFER'|'WANT', tags: [string], description? }
//
// SkillResponse:
//   { id, userId, categoryId, categoryName, name, level, type, tags, description, createdAt }
//
// CategoryResponse (recursive — has nested `children`):
//   { id, name, icon, children: [CategoryResponse] }
//
// Backend has no Edit endpoint — only add + delete. To "change" a skill,
// delete the old one and create a new one. We mirror that in the UI.

export async function getCategories() {
  const res = await client.get('/skills/categories');
  return res.data;
}

export async function getUserSkills(userId) {
  const res = await client.get(`/skills/user/${userId}`);
  return res.data;
}

export async function addOffer(userId, payload) {
  const res = await client.post(`/skills/user/${userId}/offer`, { ...payload, type: 'OFFER' });
  return res.data;
}

export async function addWant(userId, payload) {
  const res = await client.post(`/skills/user/${userId}/want`, { ...payload, type: 'WANT' });
  return res.data;
}

export async function deleteSkill(skillId) {
  await client.delete(`/skills/${skillId}`);
}

// GET /skills/search?tag=&category=
// Both params are optional; backend returns matching skills.
export async function searchSkills({ tag, category } = {}) {
  const res = await client.get('/skills/search', {
    params: { tag: tag || undefined, category: category || undefined },
  });
  return res.data;
}

// Helper: flatten the (potentially nested) category tree into a single list
// suitable for a <select>. Keeps parent name as a prefix for clarity.
export function flattenCategories(categories, parentName = null) {
  const out = [];
  for (const c of categories || []) {
    const label = parentName ? `${parentName} › ${c.name}` : c.name;
    out.push({ id: c.id, label });
    if (c.children?.length) {
      out.push(...flattenCategories(c.children, label));
    }
  }
  return out;
}
