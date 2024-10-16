import { getAllEquipmentPreview, getECategories } from '$db/Equipment.db.js';
import { getUserProfile } from '$db/User.db';
import type { LayoutServerLoad } from './$types';

// @ts-ignore
export const load: LayoutServerLoad = async ({ locals }) => {
  const userId = locals.session?.user.id ?? '';
  let user = undefined;

  if (userId) {
    user = await getUserProfile(userId);
  }

  return {
    categories: await getECategories(),
    user,
    allEquipment: await getAllEquipmentPreview()
  };
};
