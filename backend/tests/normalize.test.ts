import { normalizeMissionSkills, parseJsonField, normalizePortfolioItem, normalizeSkills } from '../src/utils/normalize';

describe('normalize utilities', () => {
  test('parseJsonField parses JSON string', () => {
    expect(parseJsonField('["a","b"]')).toEqual(['a','b']);
    expect(parseJsonField('{"a":1}')).toEqual({ a: 1 });
    expect(parseJsonField('a,b,c')).toEqual(['a','b','c']);
  });

  test('normalizeMissionSkills handles various shapes', () => {
    expect(normalizeMissionSkills('["React","Node.js"]')).toEqual(['React','Node.js']);
    expect(normalizeMissionSkills(['React','Node.js'])).toEqual(['React','Node.js']);
    expect(normalizeMissionSkills([{ name: 'React' }, { name: 'TypeScript' }])).toEqual(['React','TypeScript']);
  });

  test('normalizePortfolioItem parses technologies and links', () => {
    const item = { technologies: '["React","Next.js"]', links: '[{"type":"live","url":"https://x"}]' } as any;
    const normalized = normalizePortfolioItem(item);
    expect(normalized.technologies).toEqual(['React','Next.js']);
    expect(Array.isArray(normalized.links)).toBe(true);
  });
});
