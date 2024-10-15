import { getECategories, getESessions } from '$db/Equipment.db';
import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { ETrainingSessionZSchema } from '$lib/schemas';
import { fail, type Actions } from '@sveltejs/kit';
import { deleteSession, upsertSessions } from '$db/Session.db';

// @ts-ignore
export const load: PageServerLoad = async () => {
  return {
    allSessions: await getESessions(),
    allCategories: await getECategories(),
    sessionForm: await superValidate(zod(ETrainingSessionZSchema))
  };
};

export const actions: Actions = {
  upsertSession: async ({ request }) => {
    const sessionForm = await superValidate(request, zod(ETrainingSessionZSchema));

    if (!sessionForm.valid) {
      return fail(400, { sessionForm });
    }

    return {
      form: sessionForm,
      response: await upsertSessions(sessionForm.data)
    };
  },
  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;

    return {
      response: await deleteSession(id)
    };
  }
};
