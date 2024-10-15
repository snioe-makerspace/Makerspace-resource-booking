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

export async function deleteSession(id: string) {
  return await db.eTrainingSession.delete({
    where: {
      id
    }
  });
}

export async function registerAttendee(user_id: string, session_id: string) {
  return await db.eTrainingSessionBooking.create({
    data: {
      userId: user_id,
      sessionId: session_id,
      DateTime: new Date()
    }
  });
}
