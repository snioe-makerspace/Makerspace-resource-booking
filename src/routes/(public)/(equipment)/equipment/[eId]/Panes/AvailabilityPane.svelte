<script lang="ts">
  import Pane from '$components/Pane.svelte';
  import { addToast } from '$store/ToastStore';
  import Calendar from '$components/Calendar.svelte';
  import { superForm } from 'sveltekit-superforms/client';
  import type { SuperValidated } from 'sveltekit-superforms';
  import type {
    CartItemSchema,
    EquipmentById,
    RegisterFormSchema,
    RegisterFormType
  } from '$lib/schemas';
  import { SlotStatus, getSelectionSlots, getSlots } from '$utils/AvailabilityRules';
  import { getWeekdayDates, inverseWeekDaysEnum } from '$utils/WeekDayDates';
  import { z } from 'zod';

  export let {
    modal,
    formStore,
    registerForm,
    currentEquipment,
    registeredUser,
    instanceId,
    userId,
    trained,
    day
  } = $$props as {
    modal: boolean;
    userId: string;
    instanceId: string;
    formStore: SuperValidated<CartItemSchema>;
    registerForm: SuperValidated<RegisterFormSchema>;
    registeredUser: boolean;
    currentEquipment: EquipmentById | null;
    trained: boolean;
    day?: string;
  };

  $: equipmentId = currentEquipment?.id!;

  $: dateSelector = null as Date | null;

  $: currentInstance = currentEquipment?.instances.find((item) => item.id === instanceId);
  $: maxOffset = currentInstance?.availability.maxOffset || 1;
  $: disableWeekDays = inverseWeekDaysEnum(currentInstance?.availability.repeat || []);
  $: blackout = getWeekdayDates(disableWeekDays, maxOffset);

  const { form, errors, enhance } = superForm(formStore, {
    id: 'cartItemForm',
    taintedMessage: null,
    dataType: 'json',
    onSubmit() {
      $form = {
        end: `${slots[$form.end].slot}`,
        start: `${slots[$form.start].slot}`,
        equipmentId,
        instanceId,
        userId
      };
    },
    onResult(event) {
      if (event.result.status === 200) {
        addToast({
          message: 'Item added to cart successfully',
          type: 'success'
        });
        modal = false;
      }
      $form = {
        end: '',
        start: '',
        equipmentId: '',
        instanceId: '',
        userId: ''
      };
      dateSelector = null;
    },
    resetForm: true
  });

  const { form: rForm, enhance: rEnhance } = superForm(registerForm, {
    id: 'registerForm',
    taintedMessage: null,
    dataType: 'json',
    onSubmit() {
      console.log('Registering for training', +rForm);
    },
    onResult(event) {
      if (event.result.status === 200) {
        addToast({
          message: 'Registration successful',
          type: 'success'
        });
        modal = false;
      }
    },
    resetForm: true
  });

  $: slots = getSlots({
    booked: currentInstance?.BookingItem!,
    carted: currentInstance?.CartItem!,
    currentDay: dateSelector,
    instance: {
      start: currentInstance?.availability.starts || '00:00',
      end: currentInstance?.availability.ends || '24:00'
    },
    slotSize: currentInstance?.availability.slotSize || 30
  });

  $: selectedSlots = getSelectionSlots({
    slots: slots,
    selectedEndTime: `${$form.end}`,
    selectedStartTime: `${$form.start}`
  });

  $: options = {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  };

  $: console.log($$props.registeredUser);
</script>

<Pane className="CartItemPane" bind:open={modal} style="--paneWidth: 420px;">
  <p slot="header">Availability</p>

  <div class="CartItemPane__main" slot="free">
    {#if $$props.trained}
      <i class="CrispMessage" data-type="info" data-format="box">
        You are trained for this equipment.
      </i>
    {:else}
      <i class="CrispMessage" data-type="error" data-format="box">
        You are not trained for this equipment.
      </i>
      {#if !$$props.registeredUser}
        <i class="CrispMessage" data-type="info" data-format="box"
          >Register yourself for an upcoming training session for this equipment on {day}</i
        >
        <form use:rEnhance method="POST" action="/equipment/[eId]?/register" id="registerForm">
          <button
            class="CrispButton"
            data-type="dark-blue"
            form="registerForm"
            on:click={() => {
              $rForm = {
                userId: userId,
                equipmentId: equipmentId
              };
            }}>Register</button
          >
        </form>
      {:else}
        <i class="CrispMessage" data-type="info" data-format="box">
          You have already registered for a training session on {day}. Please attend the session
          before booking for the equipment.
        </i>
      {/if}
    {/if}
    {#if $$props.trained}
      <Calendar bind:value={dateSelector} {maxOffset} bind:blackout />
      <ul class="CartItemPane__legend">
        <li>
          <div class="CartItemPane__legend--unavailable" />
          <p>Not available</p>
        </li>
        <li>
          <div class="CartItemPane__legend--selected" />
          <p>Selected</p>
        </li>
      </ul>
      <i class="CrispMessage" data-type="info" data-format="box">
        Note: You can only book for a maximum of {maxOffset} month(s) from today.
      </i>
      <hr />
      <form use:enhance method="POST" id="cartItemForm" action="/equipment/[eId]?/add">
        <label class="CrispLabel" for="dateSelector">
          <span data-mandatory style="color: inherit;"> Date </span>
          <input
            disabled
            type="text"
            id="dateSelector"
            class="CrispInput"
            value={dateSelector?.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour12: false
            }) || 'Select a date'}
          />
        </label>

        <label class="CrispLabel" for="startTime">
          <span data-mandatory style="color: inherit;"> Start Time </span>
          <select class="CrispSelect w-100" bind:value={$form.start}>
            <option value="" disabled selected> Select a start time </option>
            {#each Object.keys(selectedSlots.startRange) as item}
              {#if selectedSlots.startRange[item].status === SlotStatus.AVAILABLE}
                <option value={item}>{item}</option>
              {/if}
            {/each}
          </select>
          {#if $errors.start}
            <p class="CrispMessage" data-type="error">{$errors.start}</p>
          {/if}
        </label>

        <label class="CrispLabel" for="endTime">
          <span data-mandatory style="color: inherit;"> End Time </span>
          <select class="CrispSelect w-100" bind:value={$form.end}>
            <option value="" disabled selected> Select an end time </option>
            {#each Object.keys(selectedSlots.endRange) as item}
              {#if selectedSlots.endRange[item].status === SlotStatus.AVAILABLE}
                <option value={item}>{item}</option>
              {/if}
            {/each}
          </select>
          {#if $errors.end}
            <p class="CrispMessage" data-type="error">{$errors.end}</p>
          {/if}
        </label>
      </form>
      <!-- {:else}
      <table class="FancyTable">
        <thead>
          <tr>
            <th>Date</th>
            <th>Start Time</th>
            <th>End Time</th>
          </tr>
        </thead>
        <tbody>

        </tbody>
        <tfoot>
          <tr>class="CrispButton"
        data-type="dark"
            <td colspan="5">
              Showing {currentEquipment.trainingSession?.length ?? 0} result(s)
            </td>
          </tr>
        </tfoot>
      </table> -->
    {/if}
  </div>
  <div class="Row--j-end gap-10" slot="footer">
    {#if $$props.trained}
      <button
        form="cartItemForm"
        class="CrispButton"
        data-type="dark-blue"
        disabled={!dateSelector || !$form.start || !$form.end}
      >
        Add to cart
      </button>
    {:else}
      <button
        class="CrispButton"
        data-type="dark"
        on:click={() => {
          modal = false;
        }}
      >
        Close
      </button>
    {/if}
  </div>
</Pane>

<style lang="scss">
  .CartItemPane {
    &__main {
      gap: 15px;
      flex: 1 1 0%;
      padding: 24px;
      overflow-y: auto;
      @include box(100%, auto);
      @include make-flex($just: flex-start);

      & > form {
        gap: 15px;
        @include box(100%, auto);
        @include make-flex($just: flex-start);
      }

      & > hr {
        width: 90%;
        border: 0.5px solid var(--border);
      }
    }

    &__legend {
      list-style: none;
      @include make-flex($dir: row);
      @include box($height: auto);
      gap: 10px;

      & > li {
        gap: 10px;
        @include make-flex($dir: row, $just: flex-start);
        @include box($height: auto);

        & > div {
          width: 20px;
          height: 20px;
          border-radius: 5px;
        }
      }
      &--unavailable {
        background: #961105
          linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.2) 25%,
            transparent 25%,
            transparent 50%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(255, 255, 255, 0.2) 75%,
            transparent 75%,
            transparent
          ) !important;
        border-color: #961105 !important;
      }

      &--selected {
        background: #f59f16 none !important;
        border-color: #f59f16 !important;
      }
    }
  }
</style>
