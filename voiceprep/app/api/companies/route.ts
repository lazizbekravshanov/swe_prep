import { getTopCompanies, searchCompanies, getCompanyBySlug } from '@/lib/problems/companies';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const query = url.searchParams.get('q');
  const slug = url.searchParams.get('slug');
  const limit = parseInt(url.searchParams.get('limit') ?? '50', 10);

  if (slug) {
    const profile = getCompanyBySlug(slug);
    if (!profile) {
      return Response.json({ error: 'Company not found' }, { status: 404 });
    }
    return Response.json(profile);
  }

  if (query) {
    return Response.json(searchCompanies(query).slice(0, limit));
  }

  return Response.json(getTopCompanies(limit));
}
