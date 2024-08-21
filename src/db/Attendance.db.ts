import { db } from '$lib/prisma';
import type { EAttendeeSchema } from '$lib/schemas';

export async function addAttendees(attendees: EAttendeeSchema[]) {
  return await db.eTraining.createMany({
    data: attendees.map((attendee) => ({
      id: attendee.id,
      userId: attendee.user_id,
      sessionId: attendee.sessionId
    }))
  });
}

export async function deleteAttendees(ids: string[]) {
  return await db.eTraining.deleteMany({
    where: {
      id: {
        in: ids.map((id) => id)
      }
    }
  });
}
