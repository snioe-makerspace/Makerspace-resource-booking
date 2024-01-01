import { auth } from "$lib/lucia";
import { LuciaError } from "lucia";
import { fail, redirect } from "@sveltejs/kit";
import { setError, superValidate } from "sveltekit-superforms/server"
import type { PageServerLoad, Actions } from "./$types";
import { loginSchema } from "$lib/schemas";
import { UserCategory } from "@prisma/client";

export const load: PageServerLoad = async ({ locals }) => {
  const form = await superValidate(loginSchema)
  if (Object.keys(locals).length === 0) return { form };

  const session = await locals.auth.validate();
  if (session) throw redirect(302, "/dash");

  return { form };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await superValidate(request, loginSchema);
    let userCategory = UserCategory.student;
    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      const key = await auth.useKey(
        "email",
        form.data.email,
        form.data.password
      );
      const session = await auth.createSession({
        userId: key.userId,
        attributes: {}
      });
      userCategory = session.user.userCategory
      locals.auth.setSession(session); // set session cookie
    } catch (e) {
      if (e instanceof LuciaError) {
        if (e.message === "AUTH_INVALID_KEY_ID") {
          return setError(form, "email", "Incorrect email");
        } else if (e.message === "AUTH_INVALID_PASSWORD") {
          return setError(form, "password", "Incorrect password");
        }
      }
      console.log(e);

      return fail(500, {
        message: "An unknown error occurred",
        form
      });
    }

    // @ts-ignore
    if(userCategory === UserCategory.admin) return redirect(302, "/admin");
    throw redirect(302, "/dash");
  }
};