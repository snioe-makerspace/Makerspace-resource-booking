import { db } from '$lib/prisma';
import type { ETrainingSessionSchema } from '$lib/schemas';

export async function upsertSessions(sessions: ETrainingSessionSchema) {
  return await db.eTrainingSession.upsert({
    where: {
      id: sessions.id
    },
    update: sessions,
    create: sessions
  });
}

export async function deleteSessions(id: string) {
  return await db.eTrainingSession.delete({
    where: {
      id
    }
  });
}
