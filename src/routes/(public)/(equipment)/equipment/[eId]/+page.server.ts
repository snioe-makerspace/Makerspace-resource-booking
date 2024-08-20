import { getEquipmentById, getUserTrainingEquipment } from '$db/Equipment.db.js';
import { superValidate } from 'sveltekit-superforms/server';
import type { PageServerLoad } from './$types';
import { CartItemZSchema } from '$lib/schemas';
import { fail, type Actions, redirect } from '@sveltejs/kit';
import { addToCart } from '$db/Cart.db';
import { zod } from 'sveltekit-superforms/adapters';
import { ESecondaryStatus } from '@prisma/client';

// @ts-ignore
export const load: PageServerLoad = async ({ params, locals }) => {
  const equipment = await getEquipmentById(params.eId);
  let trainedUsers = undefined;
  if (locals.session?.user !== undefined) {
    trainedUsers = await getUserTrainingEquipment(params.eId, locals.session?.user.id);
  }

  if (equipment === undefined) {
    throw redirect(307, '/equipment');
  }

  return {
    equipment,
    trainedUsers: trainedUsers,
    cartItemForm: await superValidate(zod(CartItemZSchema)),
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
  }
};
