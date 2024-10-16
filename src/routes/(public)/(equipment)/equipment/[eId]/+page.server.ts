import {
  getEquipmentById,
  getRegisteredUser,
  getSessionId,
  getTrainingDay,
  getUserTrainingEquipment
} from '$db/Equipment.db.js';
import { superValidate } from 'sveltekit-superforms/server';
import type { PageServerLoad } from './$types';
import { CartItemZSchema, RegisterFormZSchema } from '$lib/schemas';
import { fail, type Actions, redirect } from '@sveltejs/kit';
import { addToCart } from '$db/Cart.db';
import { zod } from 'sveltekit-superforms/adapters';
import { ESecondaryStatus } from '@prisma/client';
import { registerAttendee } from '$db/Session.db';

// @ts-ignore
export const load: PageServerLoad = async ({ params, locals, url }) => {
  const equipment = await getEquipmentById(params.eId);
  // console.log(params);
  let trainedUsers = undefined;
  let trainingDay = '';
  let registeredUser = undefined;

  if (locals.session?.user !== undefined) {
    trainedUsers = await getUserTrainingEquipment(params.eId, locals.session?.user.id);
    const sessionId = (await getSessionId(params.eId)) || '';
    registeredUser = await getRegisteredUser(locals.session?.user.id, sessionId);
  }

  if (!trainedUsers) {
    trainingDay = await getTrainingDay(params.eId);
  }

  if (equipment === undefined) {
    throw redirect(307, '/equipment');
  }

  return {
    equipment,
    trainedUsers: trainedUsers,
    trainingDay: trainingDay,
    registeredUser: registeredUser,
    availabilityPane: url.searchParams.get('availability') === 'true',
    cartItemForm: await superValidate(zod(CartItemZSchema)),
    registerForm: await superValidate(zod(RegisterFormZSchema)),
    isDeleted:
      equipment.secondaryStatus === ESecondaryStatus.DELETED ||
      equipment.secondaryStatus === ESecondaryStatus.DISABLED
  };
};

export const actions: Actions = {
  add: async ({ request }) => {
    const cartItemForm = await superValidate(request, zod(CartItemZSchema));

    if (!cartItemForm.valid) {
      return fail(400, { cartItemForm });
    }

    return {
      cartItemForm,
      response: await addToCart({ ...cartItemForm.data, userId: cartItemForm.data.userId! })
    };
  },
  register: async ({ request }) => {
    const attendeeForm = await superValidate(request, zod(RegisterFormZSchema));

    if (!attendeeForm.valid) {
      return fail(400, { attendeeForm });
    }

    return {
      attendeeForm,
      response: await registerAttendee(attendeeForm.data.userId, attendeeForm.data.equipmentId)
    };
  }
};
