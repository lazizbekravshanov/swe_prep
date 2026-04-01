import { prisma } from '@/lib/prisma';

const FREE_SESSIONS_PER_MONTH = 3;

export async function checkCanStartSession(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  plan: string;
}> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  // Pro users have unlimited sessions
  if (user.plan === 'pro') {
    return { allowed: true, remaining: Infinity, plan: 'pro' };
  }

  // Check if we need to reset the monthly counter
  const now = new Date();
  const lastReset = new Date(user.lastSessionResetAt);
  const needsReset =
    lastReset.getMonth() !== now.getMonth() ||
    lastReset.getFullYear() !== now.getFullYear();

  if (needsReset) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        sessionsThisMonth: 0,
        lastSessionResetAt: now,
      },
    });

    return {
      allowed: true,
      remaining: FREE_SESSIONS_PER_MONTH,
      plan: 'free',
    };
  }

  const remaining = FREE_SESSIONS_PER_MONTH - user.sessionsThisMonth;

  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
    plan: 'free',
  };
}
