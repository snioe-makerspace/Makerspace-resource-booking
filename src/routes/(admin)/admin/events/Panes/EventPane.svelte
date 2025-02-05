<script lang="ts">
  import Pane from '$components/Pane.svelte';
  import type { Writable } from 'svelte/store';
  import { EventStatus } from '@prisma/client';
  import type { EventSchema } from '$lib/schemas';
  import { dateProxy, superForm } from 'sveltekit-superforms/client';
  import UploadImage from '$components/UploadImage.svelte';
  import type { SuperValidated } from 'sveltekit-superforms';
  import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
  import TipTap from '$components/TipTap.svelte';
  import { addToast } from '$store/ToastStore';
  import { SupabaseEnum } from '$lib/Enums';

  export let { modal, formStore, resetForm } = $$props as {
    modal: boolean;
    resetForm: (form: Writable<EventSchema>) => void;
    formStore: SuperValidated<EventSchema>;
  };

  const { form, errors, enhance, tainted, constraints, formId } = superForm(formStore, {
    id: 'eventForm',
    dataType: 'json',
    onResult(event) {
      if (event.result.status === 200) {
        modal = false;
        addToast({
          message:
            $form?.id !== undefined ? 'Event updated successfully' : 'Event added successfully',
          type: 'success'
        });
        resetForm(form);
      }
    },
    taintedMessage: null
  });

  $: paneTitle = 'Add Event';
  $: if ($form?.id) {
    paneTitle = 'Edit Event';
  }

  const startTime = dateProxy(form, 'startTime', { format: 'datetime-local' });
  const endTime = dateProxy(form, 'endTime', { format: 'datetime-local' });
</script>

<Pane bind:open={modal} style="--paneWidth: 600px;">
  <p slot="header">
    {paneTitle}
  </p>
  <svelte:fragment slot="main">
    <form
      id={$formId}
      use:enhance
      method="POST"
      enctype="multipart/form-data"
      class="Col--center gap-10 w-100"
      action="/admin/events?/upsertEvent"
    >
      <label class="CrispLabel" for="title">
        <span data-mandatory style="color: inherit;"> Title </span>
        <input
          id="title"
          type="text"
          name="title"
          class="CrispInput"
          bind:value={$form.title}
          aria-invalid={$errors.title ? 'true' : undefined}
        />
      </label>
      {#if $errors.title}
        <p class="CrispMessage w-100" data-type="error">
          {$errors.title}
        </p>
      {/if}

      <label class="CrispLabel" for="startTime">
        <span data-mandatory style="color: inherit;"> Start time </span>
        <input
          id="startTime"
          type="datetime-local"
          name="startTime"
          class="CrispInput"
          bind:value={$startTime}
          aria-invalid={$errors.startTime ? 'true' : undefined}
          min={$form.status !== 'UPCOMING' ? new Date().toISOString().slice(0, 16) : undefined}
        />
      </label>
      {#if $errors.startTime}
        <p class="CrispMessage w-100" data-type="error">
          {$errors.startTime}
        </p>
      {/if}

      <label class="CrispLabel" for="endTime">
        <span data-mandatory style="color: inherit;"> End time </span>
        <input
          id="endTime"
          type="datetime-local"
          name="endTime"
          class="CrispInput"
          bind:value={$endTime}
          aria-invalid={$errors.endTime ? 'true' : undefined}
          min={$startTime
            ? new Date($startTime).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16)}
        />
      </label>
      {#if $errors.endTime}
        <p class="CrispMessage w-100" data-type="error">
          {$errors.endTime}
        </p>
      {/if}

      <label class="CrispLabel" for="status">
        <span data-mandatory style="color: inherit;"> Status </span>
        <select class="CrispSelect w-100" bind:value={$form.status}>
          {#each Object.keys(EventStatus) as item}
            <option value={item}>
              {item}
            </option>
          {/each}
        </select>
      </label>
      {#if $errors.status}
        <p class="CrispMessage w-100" data-type="error">
          {$errors.status}
        </p>
      {/if}

      <label class="CrispLabel" for="venue">
        <span data-mandatory style="color: inherit;"> Venue Name </span>
        <input
          id="venue"
          type="text"
          name="venue"
          class="CrispInput"
          bind:value={$form.venue}
          aria-invalid={$errors.venue ? 'true' : undefined}
          {...$constraints.venue}
        />
      </label>
      {#if $errors.venue}
        <p class="CrispMessage w-100" data-type="error">
          {$errors.venue}
        </p>
      {/if}

      <label class="CrispLabel" for="venueLink">
        <span style="color: inherit;"> Venue Link </span>
        <input
          id="venueLink"
          type="text"
          name="venueLink"
          class="CrispInput"
          placeholder="https://..."
          bind:value={$form.venueLink}
          required={false}
          {...$constraints.venueLink}
        />
      </label>
      {#if $errors.venueLink}
        <p class="CrispMessage w-100" data-type="error">
          {$errors.venueLink}
        </p>
      {/if}

      <UploadImage
        name="image"
        bucket={SupabaseEnum.EVENT}
        bind:errors={$errors.image}
        bind:image={$form.image}
      />
      <label class="CrispLabel" for="previewDesc">
        <span data-mandatory style="color: inherit;"> Preview Description </span>
        <TipTap name="previewDesc" bind:content={$form.previewDesc} />
        {#if $errors.previewDesc}
          <p class="CrispMessage w-100" data-type="error">
            {$errors.previewDesc}
          </p>
        {/if}
      </label>
      {#if $errors.previewDesc}
        <p class="CrispMessage w-100" data-type="error">
          {$errors.previewDesc}
        </p>
      {/if}

      <label class="CrispLabel" for="previewDesc">
        <span data-mandatory style="color: inherit;"> Description </span>
        <TipTap name="previewDesc" bind:content={$form.desc} />
        {#if $errors.desc}
          <p class="CrispMessage w-100" data-type="error">
            {$errors.desc}
          </p>
        {/if}
      </label>
      {#if $errors.desc}
        <p class="CrispMessage w-100" data-type="error">
          {$errors.desc}
        </p>
      {/if}
    </form>
  </svelte:fragment>
  <div class="Row--j-end gap-10" slot="footer">
    <button
      type="button"
      class="CrispButton"
      data-type="danger"
      on:click={() => {
        modal = false;
        resetForm(form);
      }}
    >
      Cancel
    </button>
    <button
      form={$formId}
      class="CrispButton"
      data-type="dark"
      type="submit"
      disabled={$form?.id !== undefined && $tainted === undefined}
    >
      {$form?.id !== undefined ? 'Update' : 'Submit'}
    </button>
  </div>
</Pane>
