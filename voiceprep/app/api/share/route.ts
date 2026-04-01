import { NextResponse } from 'next/server';

/**
 * POST /api/share — Create a share link for an interview session replay.
 *
 * Full implementation requires a Prisma ReplayShare model:
 *
 *   model ReplayShare {
 *     id        String   @id @default(cuid())
 *     token     String   @unique @default(cuid())
 *     sessionId String
 *     session   Session  @relation(fields: [sessionId], references: [id])
 *     expiresAt DateTime
 *     createdAt DateTime @default(now())
 *   }
 *
 * For MVP, this returns a mock share URL since there is no DB connected.
 */
export async function POST(req: Request) {
  const { sessionId } = (await req.json()) as { sessionId: string };

  if (!sessionId) {
    return NextResponse.json(
      { error: 'sessionId is required' },
      { status: 400 },
    );
  }

  // MVP: generate a mock token and URL.
  // In production, this would create a ReplayShare record in Prisma
  // and return the real share URL with an expiration.
  const token = `mock-${sessionId}-${Date.now().toString(36)}`;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = `${baseUrl}/share/${token}`;

  return NextResponse.json({
    url,
    token,
    expiresAt,
  });
}
