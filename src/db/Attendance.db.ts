import { db } from '$lib/prisma';
import type { EAttendeeSchema } from '$lib/schemas';

export async function addAttendees(attendees: EAttendeeSchema[]) {
  await db.eTrainingSessionBooking.deleteMany({
    where: {
      user_id: {
        in: attendees.map((attendee) => attendee.user_id)
      },
      sessionId: {
        in: attendees.map((attendee) => attendee.sessionId)
      }
    }
  });

  return await db.eTraining.createMany({
    data: attendees.map((attendee) => ({
      id: attendee.id,
      userId: attendee.user_id,
      sessionId: attendee.sessionId,
      datetime: attendee.datetime
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
