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

export async function registerAttendee(user_id: string, equipmentId: string) {
  const categoryId = await db.equipment.findFirst({
    where: {
      id: equipmentId
    },
    select: {
      category: {
        select: {
          id: true
        }
      }
    }
  });

  const sessionId = (await db.eTrainingSession.findFirst({
    where: {
      categoryIds: {
        has: categoryId?.category.id
      }
    },
    select: {
      id: true
    }
  })) || {
    id: ''
  };

  return await db.eTrainingSessionBooking.create({
    data: {
      user_id,
      sessionId: sessionId?.id,
      DateTime: new Date()
    }
  });
}
