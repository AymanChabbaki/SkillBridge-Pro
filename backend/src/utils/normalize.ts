export function normalizeSkills(skills: any): any[] {
  if (!skills) return [];

  // If already an array
  if (Array.isArray(skills)) return skills;

  // If stored as JSON string
  if (typeof skills === 'string') {
    try {
      const parsed = JSON.parse(skills);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === 'object') return Object.values(parsed);
    } catch (e) {
      // fallback: return single string as array
      return [skills];
    }
  }

  // If it's an object (e.g. {React: 'expert'} or [{name,..}])
  if (typeof skills === 'object') {
    // If it's an object with numeric keys or values are objects/strings
    try {
      return Object.values(skills);
    } catch (e) {
      return [];
    }
  }

  return [];
}

export function normalizeLanguages(languages: any): string[] {
  if (!languages) return [];
  if (Array.isArray(languages)) return languages;
  if (typeof languages === 'string') {
    try {
      const parsed = JSON.parse(languages);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === 'object') return Object.values(parsed).map(String);
    } catch (e) {
      return [languages];
    }
  }
  if (typeof languages === 'object') {
    try {
      return Object.values(languages).map(String);
    } catch (e) {
      return [];
    }
  }
  return [];
}

export function normalizeFreelancerProfile(profile: any) {
  if (!profile) return profile;

  const p = { ...profile };

  try {
    p.skills = normalizeSkills(p.skills);
  } catch (e) {
    p.skills = [];
  }

  try {
    p.languages = normalizeLanguages(p.languages);
  } catch (e) {
    p.languages = [];
  }

  return p;
}

export function parseJsonField(field: any) {
  if (field === null || field === undefined) return null;
  if (Array.isArray(field) || typeof field === 'object') return field;
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch (e) {
      // if it's a comma separated list
      if (field.includes(',')) return field.split(',').map(s => s.trim());
      return field;
    }
  }
  return field;
}

export function normalizeMissionSkills(skills: any): string[] {
  const parsed = parseJsonField(skills);
  if (Array.isArray(parsed)) return parsed.map((s: any) => (typeof s === 'string' ? s : (s.name || s))).filter(Boolean);
  return [];
}

export function normalizePortfolioItem(item: any) {
  if (!item) return item;
  const it = { ...item };
  try {
    it.technologies = parseJsonField(it.technologies) || [];
  } catch (e) { it.technologies = []; }

  try {
    it.links = parseJsonField(it.links) || [];
  } catch (e) { it.links = []; }

  return it;
}
