<script lang="ts">
  import Pane from '$components/Pane.svelte';
  import type { getUserBookings } from '$db/Cart.db';
  import type { BookingUpdateSchema } from '$lib/schemas';
  import { addToast } from '$store/ToastStore';
  import { BookingStatus } from '@prisma/client';
  import { superForm, type SuperValidated } from 'sveltekit-superforms';
  import { PaymentStatus } from '@prisma/client';

  export let { modal, formStore, booking } = $$props as {
    modal: boolean;
    formStore: SuperValidated<BookingUpdateSchema>;
    booking: Awaited<ReturnType<typeof getUserBookings>>[0];
  };

  const defaultPaymentStatus = booking.paymentStatus;
  const defaultStatus = booking.status;

  const { form, enhance } = superForm(formStore, {
    id: 'bookingUpdateForm',
    dataType: 'json',
    taintedMessage: null,
    onSubmit() {
      form.set({
        ...$form,
        bookingId: booking.id,
        userEmail: booking.user.email,
        userName: booking.user.name
      });
    },
    onResult(event) {
      if (event.result.status === 200) {
        addToast({ message: 'Updated Booking', type: 'success' });
        modal = false;
      }
    }
  });

  $: form.set({
    bookingId: booking.id,
    status: booking.status,
    adminNotes: booking.adminNotes!,
    paymentStatus: booking.paymentStatus,
    paymentId: booking.paymentId ?? '',
    userName: booking.user.name,
    userEmail: booking.user.email
  });
</script>

<Pane
  bind:open={modal}
  style="--paneWidth: 450px;"
  on:close={() => {
    modal = false;
    $form = {
      bookingId: '',
      // @ts-ignore
      status: '',
      adminNotes: ''
    };
  }}
>
  <p slot="header">Update Booking</p>
  <svelte:fragment slot="main">
    <form
      method="POST"
      action="/admin/orders?/update"
      id="bookingUpdateForm"
      use:enhance
      class="Col--center gap-15"
    >
      <label for="mentor" class="CrispLabel">
        <span style="color: inherit;" data-mandatory> Mentor </span>
        <input
          disabled
          id="mentor"
          type="text"
          name="mentor"
          class="CrispInput"
          bind:value={booking.mentor}
        />
      </label>
      <label for="description" class="CrispLabel">
        <span style="color: inherit;" data-mandatory> Description </span>
        <textarea
          disabled
          id="description"
          name="description"
          class="CrispInput"
          data-type="text-area"
          bind:value={booking.description}
          placeholder="Tell us about your project...(Course, Research, etc)"
        />
      </label>

      <label for="deadline" class="CrispLabel">
        <span style="color: inherit;" data-mandatory> Deadline </span>
        <input
          disabled
          type="date"
          id="deadline"
          name="deadline"
          class="CrispInput"
          value={new Date(booking.deadline).toISOString().split('T')[0]}
          min={new Date().toISOString().split('T')[0]}
        />
      </label>
      <label for="instance" class="CrispLabel" style="overflow-x: auto; padding-bottom: 10px">
        <span style="color: inherit;"> Instances </span>
        <table class="FancyTable">
          <thead>
            <tr>
              <th> Name </th>
              <th> Slot Date </th>
              <th> Timing </th>
              <th> Cost </th>
            </tr>
          </thead>
          <tbody>
            {#if booking.items.length >= 0}
              {#each booking.items as item}
                <tr>
                  <td>
                    <a
                      href="/equipment/{item.instance.equipmentId}"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.instance.name}
                    </a>
                  </td>
                  <td>
                    {new Date(item.start).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td>
                    {new Date(item.start).toLocaleString('en-US', {
                      hour: 'numeric',
                      minute: 'numeric',
                      hour12: true
                    })}
                    {' '}-{' '}
                    {new Date(item.end).toLocaleString('en-US', {
                      hour: 'numeric',
                      minute: 'numeric',
                      hour12: true
                    })}
                  </td>
                  <td> {item.cost} </td>
                </tr>
              {/each}
            {:else}
              <tr>
                <td colspan="4">
                  <i class="CrispMessage" data-type="info" data-format="box"> No items found </i>
                </td>
              </tr>
            {/if}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4">
                Showing {booking.items.length} result(s)
              </td>
            </tr>
          </tfoot>
        </table>
      </label>

      <label for="cost" class="CrispLabel">
        <span style="color: inherit;"> Cost </span>
        <input
          disabled
          readonly
          id="cost"
          type="text"
          name="cost"
          class="CrispInput"
          value={new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
          }).format(booking.cost)}
        />
      </label>

      <label for="paymentId" class="CrispLabel">
        <span style="color: inherit;" data-mandatory> paymentId </span>
        <input
          id="paymentId"
          name="paymentId"
          class="CrispInput"
          type="text"
          disabled
          readonly
          bind:value={booking.paymentId}
        />
      </label>

      <label for="status" class="CrispLabel" style="overflow-x: auto; padding-bottom: 10px;">
        <span style="color: inherit;" data-mandatory> Booking Status </span>
        <select
          id="status"
          name="status"
          class="CrispSelect w-100"
          bind:value={$form.status}
          disabled={booking.status === BookingStatus.CANCELLED}
          required
        >
          <!-- <option value="" disabled selected> Select Status </option> -->
          {#each Object.values(BookingStatus) as item}
            <option value={item} selected={item === booking.status ? true : undefined}>
              {item}
            </option>
          {/each}
        </select>
      </label>

      <label for="paymentStatus" class="CrispLabel" style="overflow-x: auto; padding-bottom: 10px;">
        <span style="color: inherit;" data-mandatory> Payment Status </span>
        <select
          id="paymentStatus"
          name="paymentStatus"
          class="CrispSelect w-100"
          bind:value={$form.paymentStatus}
          disabled={booking.status === BookingStatus.CANCELLED}
          required
        >
          <!-- <option value="" disabled selected> Select Payment Status </option> -->
          {#each Object.keys(PaymentStatus) as item}
            <option value={item} selected={item === booking.paymentStatus ? true : undefined}>
              {item}
            </option>
          {/each}
        </select>

        {#if booking.status !== BookingStatus.CANCELLED}
          <label for="adminNotes" class="CrispLabel">
            <span style="color: inherit;"> Admin Notes </span>
            <textarea
              id="adminNotes"
              name="adminNotes"
              class="CrispInput"
              data-type="text-area"
              bind:value={$form.adminNotes}
              placeholder="Add notes for the user..."
            />
          </label>
        {/if}
      </label>
    </form>
  </svelte:fragment>
  <svelte:fragment slot="footer">
    {#if booking.status !== BookingStatus.CANCELLED}
      <button
        class="CrispButton"
        type="submit"
        form="bookingUpdateForm"
        disabled={(defaultStatus === $form.status && booking.adminNotes === $form.adminNotes) ||
          defaultPaymentStatus === $form.paymentStatus}
        data-type="black-outline"
      >
        Update Booking
      </button>
    {/if}
  </svelte:fragment>
</Pane>
