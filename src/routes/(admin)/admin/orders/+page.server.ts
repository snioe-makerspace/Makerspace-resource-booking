import { getAllBookings, updateBooking } from '$db/Cart.db';
import { superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { BookingUpdateZSchema } from '$lib/schemas';
import { fail } from '@sveltejs/kit';
import Hello from '$lib/emails/confirmed-booking.svelte';
import nodemailer from 'nodemailer';
import { render } from 'svelte-email';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: 'makerspace.soe@snu.edu.in',
    pass: process.env.GOOGLE_APP_PASSWORD
  }
});

// @ts-ignore
export const load: PageServerLoad = async () => {
  return {
    bookingUpdateForm: await superValidate(zod(BookingUpdateZSchema)),
    bookings: await getAllBookings()
  };
};

export const actions: Actions = {
  async update({ request }) {
    const bookingUpdateForm = await superValidate(request, zod(BookingUpdateZSchema));
    if (!bookingUpdateForm.valid) {
      return fail(400, { bookingUpdateForm });
    }

    const bookings = await getAllBookings();

    // console.log(
    //   bookings
    //     .filter((booking) => booking.id === bookingUpdateForm.data.bookingId)
    //     .map((booking) => booking.items.map((item) => item.instance))
    // );

    const emailHtml = render({
      template: Hello,
      props: {
        name: bookingUpdateForm.data.userName,
        bookings: bookings
          .filter((booking) => booking.id === bookingUpdateForm.data.bookingId)
          .map((booking) => booking.items)[0],
        status: bookingUpdateForm.data.status,
        adminNotes: bookingUpdateForm.data.adminNotes || ''
      }
    });

    const options = {
      from: 'makerspace.soe@snu.edu.in',
      to: bookingUpdateForm.data.userEmail,
      subject: 'Booking Confirmation',
      html: emailHtml
    };

    if (bookingUpdateForm.data.status === 'APPROVED') {
      transporter.sendMail(options);
    }

    return {
      bookingUpdateForm,
      response: await updateBooking({
        ...bookingUpdateForm.data,
        adminNotes: bookingUpdateForm.data.adminNotes || ''
      })
    };
  }
};
