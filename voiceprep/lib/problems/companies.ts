import profilesData from '@/data/companies/profiles.json';
import type { CompanyProfile } from '@/lib/types';

// New parser wraps profiles in { total_companies, companies: [...] }
const profilesWrapper = profilesData as unknown as {
  total_companies: number;
  companies: CompanyProfile[];
};
const profiles: CompanyProfile[] = profilesWrapper.companies;

// Index by slug for fast lookup
const profilesBySlug = new Map<string, CompanyProfile>();
const profilesByName = new Map<string, CompanyProfile>();
for (const p of profiles) {
  profilesBySlug.set(p.slug, p);
  profilesByName.set(p.name, p);
}

export function getAllCompanyProfiles(): CompanyProfile[] {
  return profiles;
}

export function getCompanyBySlug(slug: string): CompanyProfile | undefined {
  return profilesBySlug.get(slug);
}

export function getCompanyByName(name: string): CompanyProfile | undefined {
  return profilesByName.get(name);
}

/**
 * Get top companies sorted by total problem count (parser default).
 */
export function getTopCompanies(limit = 50): CompanyProfile[] {
  return profiles.slice(0, limit);
}

/**
 * Search companies by name prefix.
 */
export function searchCompanies(query: string): CompanyProfile[] {
  const q = query.toLowerCase().trim();
  if (!q) return getTopCompanies();
  return profiles.filter((p) => p.name.toLowerCase().includes(q));
}
