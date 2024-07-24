import { getAllContent } from '$db/CMS.db';
import { checkRevalidateProfile, removeRevalidateProfile } from '$db/User.db';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { getSession, session, supabase } }) => {
  if (session) {
    const isRevalidateUser = await checkRevalidateProfile(session.user.id);
    if (isRevalidateUser) {
      supabase.auth.refreshSession();
      session = await getSession();
      removeRevalidateProfile(session?.user.id!);
    }
  }

  return {
    session: session,
    content: await getAllContent()
  };
};
