<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import type { EAttendeeSchema } from '$lib/schemas';
  import { nanoid } from 'nanoid';
  import { addToast } from '$store/ToastStore';

  export let data: PageData;

  $: selectedSessionId = '';
  // $: allEquipment = data.allEquipment;
  $: allSessionCategories = data.allSessions;
  $: attendees = data.allSessionUsers.filter(
    (sessionUser) => sessionUser.sessionId === selectedSessionId
  );

  $: options = {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  };

  const { form: attendeeForm, enhance: attendeeEnhance } = superForm(data.attendanceForm, {
    id: 'AttendeeForm',
    dataType: 'json',
    onSubmit() {
      attendeeForm.set({
        add: [...operations.add],
        delete: [...operations.delete].map((i) => i.id!)
      });
    },
    onResult(event) {
      if (event.result.status === 200) {
        addToast({ message: 'Attendance updated', type: 'success' });
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
  } as { add: EAttendeeSchema[]; delete: EAttendeeSchema[] };

  $: addModeItem = null as EAttendeeSchema | null;

  const newInputFocus = (element: HTMLInputElement, id: string) => {
    if (id === addModeItem?.id) {
      element.focus();
    }
  };

  $: filteredUsers = <any[]>[];

  function handleInput(e: any) {
    const input = e.target.value.toLowerCase();
    if (input === '') {
      filteredUsers = [];
      return;
    }
    filteredUsers = data.allUsers.filter((user) => user.name.toLowerCase().startsWith(input));
    filteredUsers = filteredUsers.filter(
      (user) => !attendees.map((i) => i.userId).includes(user.id)
    );
    console.log(filteredUsers);
  }
</script>

<main class="AdminAttendance">
  <header>
    <label class="CrispLabel" for="startTime">
      <span data-mandatory style="color: inherit;"> Equipment </span>
      <select class="CrispSelect w-100" bind:value={selectedSessionId}>
        <option value="" disabled selected> Select a Category </option>
        {#each allSessionCategories as item}
          <option value={item.id}>{item.name}</option>
        {/each}
      </select>
    </label>
    <!-- <label class="CrispLabel" for="startTime">
      <span data-mandatory style="color: inherit;"> Date of Session </span>
      <select class="CrispSelect w-100" bind:value={selectedSessionId}>
        <option value="" disabled selected> Select the date of training session </option>
        {#each allSessions as item}
          <option value={item.id}>
            {item.day}
          </option>
        {/each}
      </select>
    </label> -->
    <span class="Row--center gap-15">
      <button
        class="CrispButton"
        on:click={() => {
          if (!operations.add.every((i) => i.id !== '')) {
            return;
          }

          addModeItem = {
            id: nanoid(),
            sessionId: selectedSessionId,
            name: '',
            user_id: '',
            datetime: new Date()
          };

          operations.add = [...operations.add, addModeItem];
        }}
        data-type="dark-blue"
        disabled={selectedSessionId === ''}
      >
        Add Attendee
      </button>
    </span>
  </header>
  <form
    method="POST"
    id="AttendeeForm"
    use:attendeeEnhance
    class="AdminAttendance__content"
    action="/admin/attendance?/attendanceCrud"
  >
    <table class="FancyTable">
      <thead>
        <tr>
          <th> Name </th>
          <th> Email </th>
          <th> Mobile </th>
          <th> Date </th>
          <th> </th>
        </tr>
      </thead>
      <tbody>
        {#if attendees && attendees.length > 0}
          {#each attendees as attendee}
            <tr class:delete={operations.delete.map((i) => i.id).includes(attendee.id)}>
              <td> {attendee.user.name} </td>
              <td> {attendee.user.email} </td>
              <td> {attendee.user.mobile} </td>
              <td> {attendee.datetime.toLocaleDateString('en-GB')} </td>
              <td>
                <button
                  class="CrispButton"
                  type="button"
                  on:click={() => {
                    if (operations.delete.map((i) => i.id).includes(attendee.id)) {
                      operations.delete = operations.delete.filter((i) => i.id !== attendee.id);
                    } else {
                      operations.delete = [
                        ...operations.delete,
                        {
                          id: attendee.id,
                          sessionId: attendee.sessionId,
                          name: attendee.user.name,
                          user_id: attendee.userId,
                          datetime: attendee.datetime
                        }
                      ];
                    }
                  }}
                >
                  {operations.delete.map((i) => i.id).includes(attendee.id) ? 'Cancel' : 'Delete'}
                </button>
              </td>
            </tr>
          {/each}
        {:else}
          <tr class="empty">
            <td colspan="5">
              <i class="CrispMessage" data-type="error" data-format="box"> No results found </i>
            </td>
          </tr>
        {/if}
        {#each operations.add as item}
          <tr class="add">
            <td colspan="5">
              <div class="Row--center gap-10 AdminAttendance__autocomplete">
                <input
                  type="text"
                  class="CrispInput"
                  use:newInputFocus={item.id}
                  bind:value={item.name}
                  style="--crp-input-height: 32px"
                  on:input={handleInput}
                />
                <ul
                  class="AdminAttendance__autocomplete--list"
                  style={`display: ${addModeItem?.id === item.id ? 'block' : 'none'}`}
                >
                  {#each filteredUsers as user}
                    <li>
                      <button
                        on:click={() => {
                          item.user_id = user.id;
                          filteredUsers = [];
                          item.name = user.name;
                        }}
                      >
                        {user.name} | {user.typeData.studentId} | {user.email}
                      </button>
                    </li>
                  {/each}
                </ul>
                <button
                  type="button"
                  class="CrispButton"
                  style="--crp-button-width: 30px"
                  data-type="danger"
                  data-icon={String.fromCharCode(58829)}
                  on:click={() => {
                    if (addModeItem) {
                      item = { ...addModeItem };
                      operations.add = operations.add.filter((i) => i.id !== item.id);
                    }
                  }}
                />
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="4">
            Showing {attendees?.length ?? 0} result(s)
          </td>
          <td style="display: flex; justify-content: end">
            <button
              class="CrispButton"
              form="AttendeeForm"
              type="submit"
              data-type="black-outline"
              disabled={operations.add.length === 0 && operations.delete.length === 0}
            >
              Update
            </button>
          </td>
        </tr>
      </tfoot>
    </table>
  </form>
</main>

<style lang="scss">
  .AdminAttendance {
    gap: 24px;
    padding: 24px;
    @include box();
    @include make-flex($just: flex-start);
    max-width: $maxDashWidth;

    & > header {
      gap: 15px;
      @include box($height: auto);
      @include make-flex($dir: row, $just: space-between, $align: flex-end);

      @include respondAt(645px) {
        align-items: flex-end;
        flex-direction: column;
      }
    }

    &__content {
      @include box();
      overflow: auto;
      padding-right: 5px;
      scrollbar-gutter: stable;
      max-height: calc(100vh - 112px);
    }

    &__autocomplete {
      position: relative;

      &--list {
        list-style: none;
        padding: 0;
        margin: 0;
        background-color: var(--background);
        // border: 1px solid var(--border);
        position: absolute;
        z-index: 1;
        width: 100%;
        max-height: 200px;
        overflow-y: auto;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
        border-radius: 5px;
        margin-top: 70px;

        & > li {
          & > button {
            width: 100%;
            padding: 10px 10px;
            cursor: pointer;
            background-color: transparent;
            border: none;
            text-align: left;

            &:hover {
              background-color: var(--buttonHoverBG);
            }
          }
        }
      }
    }
  }

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
