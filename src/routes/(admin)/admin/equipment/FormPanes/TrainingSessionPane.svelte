<script lang="ts">
  import Calendar from '$components/Calendar.svelte';
  import Pane from '$components/Pane.svelte';
  import nanoid from '$lib/nanoid';
  import type { ESchema, ETrainingCRUDSchema, ETrainingSessionSchema } from '$lib/schemas';
  import { addToast } from '$store/ToastStore';
  import { getSelectionSlots, getSlots } from '$utils/AvailabilityRules';
  import { getWeekdayDates } from '$utils/WeekDayDates';
  import type { SuperValidated } from 'sveltekit-superforms';
  import { superForm } from 'sveltekit-superforms/client';

  export let { currentEquipment, modal, formStore } = $$props as {
    modal: boolean;
    formStore: SuperValidated<ETrainingCRUDSchema>;
    currentEquipment: ESchema | null;
  };

  const { form: sessionForm, enhance: sessionEnhance } = superForm(formStore, {
    id: 'sessionForm',
    dataType: 'json',
    onSubmit() {
      operations.add.forEach((i) => {
        i.end = slots[i.end].slot.toISOString();
        i.start = slots[i.start].slot.toISOString();
      });

      sessionForm.set({
        add: [...operations.add],
        delete: [...operations.delete].map((i) => i.id!)
      });
    },
    onResult(event) {
      if (event.result.status === 200) {
        addToast({ message: 'Training sessions updated', type: 'success' });
        modal = false;
        addModeItem = null;
        operations = {
          add: [],
          delete: []
        };
      }
    },
    taintedMessage: null
  });

  $: operations = {
    add: [],
    delete: []
  } as { add: ETrainingSessionSchema[]; delete: ETrainingSessionSchema[] };

  $: addModeItem = null as ETrainingSessionSchema | null;

  $: eTrainingSession = currentEquipment?.trainingSession;

  $: options = {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  };

  $: dateSelector = null as Date | null;

  $: eId = currentEquipment?.id as string;

  $: maxOffset = 1;
  $: disableWeekDays = [];
  $: blackout = getWeekdayDates(disableWeekDays, maxOffset);

  $: currentHours = '9:00';

  $: slots = getSlots({
    booked: [],
    carted: [],
    currentDay: dateSelector,
    instance: {
      start: currentHours,
      end: '24:00'
    },
    slotSize: 30
  });

  const d = new Date('October 13, 2014 11:13:00');

  $: selectedSlots = getSelectionSlots({
    slots,
    selectedEndTime: operations.add[0]?.end || '',
    selectedStartTime: operations.add[0]?.start || ''
  });
</script>

<Pane bind:open={modal} style="--paneWidth: 500px;" on:close={() => (modal = false)}>
  <p slot="header">Sessions: {currentEquipment?.name}</p>
  <svelte:fragment slot="main">
    {#if eTrainingSession}
      <form
        method="POST"
        id="sessionForm"
        use:sessionEnhance
        class="SessionForm"
        style="overflow:hidden"
        action="/admin/equipment?/trainingSessionCRUD"
      >
        <table class="FancyTable">
          <thead>
            <tr>
              <th>Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th style="padding: 12px; display: flex; align-items: flex-end;">
                <button
                  type="button"
                  class="CrispButton"
                  data-icon={String.fromCharCode(57669)}
                  style="--crp-button-width: 30px"
                  disabled={!operations.add.every(
                    (i) =>
                      i.equipmentId.trim() !== '' || i.start.trim() !== '' || i.end.trim() !== ''
                  )}
                  on:click={() => {
                    if (
                      !operations.add.every(
                        (i) =>
                          i.equipmentId.trim() !== '' ||
                          i.start.trim() !== '' ||
                          i.end.trim() !== ''
                      )
                    ) {
                      return;
                    }

                    addModeItem = {
                      id: nanoid(),
                      equipmentId: eId,
                      start: '',
                      end: ''
                    };

                    operations.add = [...operations.add, addModeItem];
                  }}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {#if eTrainingSession.length === 0}
              <tr>
                <td colspan="4">
                  <i class="CrispMessage" data-type="info" data-format="box"> No sessions found </i>
                </td>
              </tr>
            {/if}
            {#each eTrainingSession as day}
              <tr class:delete={operations.delete.map((i) => i.id).includes(day.id)}>
                <td>{new Date(day.start).toLocaleDateString('en-US', options)}</td>
                <td>
                  {new Date(day.start).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                  })}
                </td>
                <td>
                  {new Date(day.end).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                  })}
                </td>
                <td>
                  <button
                    type="button"
                    class="CrispButton"
                    style="--crp-button-width: 30px"
                    data-type="danger"
                    data-icon={operations.delete.map((i) => i.id).includes(day.id)
                      ? String.fromCharCode(57702)
                      : String.fromCharCode(58829)}
                    on:click={() => {
                      if (operations.delete.map((i) => i.id).includes(day.id)) {
                        operations.delete = operations.delete.filter((i) => i.id !== day.id);
                      } else {
                        operations.delete = [...operations.delete, day];
                      }
                    }}
                  /></td
                >
              </tr>
            {/each}
            {#each operations.add as day}
              <tr class="add">
                <td colspan="4" style="gap: 15px;">
                  <Calendar bind:value={dateSelector} {maxOffset} bind:blackout />

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
                    <select class="CrispSelect w-100" bind:value={day.start}>
                      <option value="" disabled selected> Select a start time </option>
                      {#each Object.keys(selectedSlots.startRange) as item}
                        {#if selectedSlots.startRange[item].status}
                          <option value={item}>{item}</option>
                        {/if}
                      {/each}
                    </select>
                  </label>

                  <label class="CrispLabel" for="endTime">
                    <span data-mandatory style="color: inherit;"> End Time </span>
                    <select class="CrispSelect w-100" bind:value={day.end}>
                      <option value="" disabled selected> Select a end time </option>
                      {#each Object.keys(selectedSlots.endRange) as item}
                        {#if selectedSlots.endRange[item].status}
                          <option value={item}>{item}</option>
                        {/if}
                      {/each}
                    </select>
                  </label>
                </td>
              </tr>
            {/each}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4">
                Showing {eTrainingSession?.length ?? 0} result(s)
              </td>
            </tr>
          </tfoot>
        </table>
      </form>
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="footer">
    <button
      class="CrispButton"
      form="sessionForm"
      data-type="black-outline"
      disabled={operations.add.length === 0 && operations.delete.length === 0}
    >
      Update
    </button>
  </svelte:fragment>
</Pane>

<style lang="scss">
  .delete {
    & > * {
      background-color: var(--paleRed);
      color: var(--lightRed);
    }
  }

  .add {
    & > * {
      background-color: var(--lightGreen);
      color: var(--green);
    }
  }
</style>
