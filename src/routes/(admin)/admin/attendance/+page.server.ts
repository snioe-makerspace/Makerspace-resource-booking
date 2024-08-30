import type { PageServerLoad } from './$types';
import { getESessions, getSessionUsers } from '$db/Equipment.db';
import { getAllUsers } from '$db/User.db';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { EAttendanceZSchema } from '$lib/schemas';
import { fail, type Actions } from '@sveltejs/kit';
import { addAttendees, deleteAttendees } from '$db/Attendance.db';

// @ts-ignore
export const load: PageServerLoad = async () => {
  return {
    // allEquipment: await getAllEquipment(),
    allSessions: await getESessions(),
    allSessionUsers: await getSessionUsers(),
    allUsers: await getAllUsers(),
    attendanceForm: await superValidate(zod(EAttendanceZSchema))
  };
};

export const actions: Actions = {
  attendanceCrud: async ({ request }) => {
    const attendanceForm = await superValidate(request, zod(EAttendanceZSchema));

    if (!attendanceForm.valid) {
      return fail(400, { attendanceForm });
    }

    return {
      form: attendanceForm,
      response: {
        add: attendanceForm.data.add.length > 0 ? await addAttendees(attendanceForm.data.add) : [],
        delete:
          attendanceForm.data.delete.length > 0
            ? await deleteAttendees(attendanceForm.data.delete)
            : []
      }
    };
  }
};
