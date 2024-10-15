<script lang="ts">
  import { enhance } from '$app/forms';
  import WeekDays from '$components/WeekDays.svelte';
  import clickOutside from '$directive/clickOutside';
  import { WeekDaysEnum } from '$lib/schemas';
  import type { PageData } from './$types';
  import AddSessionPane from './FormPanes/AddSessionPane.svelte';
  import RegistrationsPane from './FormPanes/RegistrationsPane.svelte';

  export let data: PageData;

  $: ({ allSessions, allCategories, sessionForm, allRegisteredUsers } = data);

  $: editModal = false;
  $: registrationModal = false;
  $: editSessionID = '';

  const dayOrder: (keyof typeof WeekDaysEnum)[] = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
  const dayOrderMap = new Map(dayOrder.map((day, index) => [WeekDaysEnum[day], index]));

  $: allSessions.sort((a, b) => {
    const orderA = dayOrderMap.get(a.day) ?? -1;
    const orderB = dayOrderMap.get(b.day) ?? -1;
    return orderA - orderB;
  });
</script>

{#if editModal}
  <AddSessionPane
    bind:modal={editModal}
    bind:eCategories={allCategories}
    bind:formStore={sessionForm}
  />
{/if}

<RegistrationsPane
  bind:modal={registrationModal}
  bind:registeredUsers={allRegisteredUsers}
  bind:sessionID={sessionForm.data.id}
/>

<main class="AdminSessions">
  <header>
    <input type="search" class="CrispInput" placeholder="Search sessions" />
    <span class="Row--center gap-15">
      <button
        class="CrispButton"
        data-type="dark-blue"
        on:click={() => {
          editModal = !editModal;
          sessionForm.data = {
            id: '',
            name: '',
            day: WeekDaysEnum.Su,
            categoryIds: []
          };
        }}
      >
        Add sessions
      </button>
    </span>
  </header>
  <table class="FancyTable">
    <thead>
      <tr>
        <th>Session Name</th>
        <th>Days</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {#if allSessions.length === 0}
        <tr>
          <td colspan="3">No sessions found</td>
        </tr>
      {/if}
      {#each allSessions as session}
        {@const isDeleted = false}
        <tr>
          <td>{session.name}</td>
          <td>{session.day}</td>
          <td style="">
            <details
              data-no-marker
              class="CrispMenu AdminSessions__menu"
              use:clickOutside
              open={editSessionID === session.id}
              on:outclick={() => {
                editSessionID = '';
                return false;
              }}
            >
              <summary>
                <button
                  class="CrispButton"
                  data-icon={String.fromCharCode(58835)}
                  style="--crp-button-height: 24px; 
												--crp-button-width: auto; 
												--crp-button-padding-left: 6px; 
												--crp-button-padding-right: 6px;"
                  data-type="ghost"
                  on:click={() => (editSessionID = session.id)}
                />
              </summary>
              <ul
                class="AdminSessions__box CrispMenu__content"
                data-align="top"
                data-direction="left"
                style="--crp-menu-width: 200px"
              >
                <button
                  class="CrispButton"
                  data-border="false"
                  on:click={() => {
                    if (sessionForm) {
                      sessionForm.data = {
                        ...session
                      };
                    }
                    editModal = true;
                    editSessionID = '';
                  }}
                >
                  Edit
                </button>
                <button
                  class="CrispButton"
                  data-border="false"
                  on:click={() => {
                    if (sessionForm) {
                      sessionForm.data = {
                        ...session
                      };
                    }
                    registrationModal = true;
                    editSessionID = '';
                  }}
                >
                  Registrations
                </button>
                <form
                  use:enhance
                  class="w-100"
                  method="POST"
                  action="/admin/sessions?/delete"
                  on:submit={() => {
                    return confirm('Are you sure you want to delete this equipment permanently?');
                  }}
                >
                  <input type="hidden" name="id" value={session.id} />
                  <button
                    class="CrispButton"
                    data-type={'danger'}
                    data-border="false"
                    class:active={editSessionID === session.id}
                  >
                    Delete
                  </button>
                </form>
              </ul>
            </details>
          </td>
        </tr>
        <tr>
          <td colspan="3" class="AdminSessions__subTableBox">
            <table class="FancyTable">
              <thead>
                <tr>
                  <th>Categories</th>
                </tr>
              </thead>
              <tbody>
                {#each session.categoryIds as id}
                  <tr>
                    <td>{allCategories.find((category) => category.id === id)?.name}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </td>
        </tr>
      {/each}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="3">
          Showing {allSessions?.length ?? 0} result(s)
        </td>
      </tr>
    </tfoot>
  </table>
</main>

<style lang="scss">
  .AdminSessions {
    gap: 24px;
    padding: 24px;
    @include box();
    @include make-flex($just: flex-start);
    max-width: $maxDashWidth;

    & > header {
      gap: 15px;
      @include box($height: auto);
      @include make-flex($dir: row, $just: space-between);

      @include respondAt(645px) {
        align-items: flex-end;
        flex-direction: column;
      }
      & > input {
        --crp-input-width: 270px;

        @include respondAt(645px) {
          --crp-input-width: 100%;
        }
      }
    }

    &__menu {
      min-width: unset;
      @include box(34px, 24px);
      --crp-menu-offset: 4px;
      & > summary {
        @include box(34px, 24px);
        border: 1px solid transparent;
        box-shadow: 0px 0px 0px transparent;
        padding: 0;

        &:hover {
          background-color: transparent;
        }

        &::before {
          content: '';
        }
      }
    }

    &__box {
      @include box(110px, auto);

      button {
        width: 100%;
        // border: 0px solid transparent;

        &.active {
          --crp-button-border: 1px solid #dfe3e6;
        }
      }
    }

    &__subTableBox {
      padding: 0 0 0 24px;
      position: relative;
      &::before {
        content: '';
        left: 12px;
        display: block;
        @include box(10px, 20px);
        border-radius: 0 0 0 6px;
        position: absolute;
        border-top: 0px solid transparent;
        border-left: 2px dashed #c1c3c6;
        border-right: 0px solid transparent;
        border-bottom: 2px dashed #c1c3c6;
      }

      &:hover {
        background-color: #ffa;
        transition: background-color 0.3s ease-in-out;
      }

      .FancyTable {
        tr {
          & > th {
            border-top: 0;
            // background-color: rgb(243, 243, 243);
            padding: 9px 12px 9px 14px;
            &:first-child {
              border-top-left-radius: 0;
              border-top-right-radius: 0;
            }

            &:last-child {
              border-top-right-radius: 0;
              border-right: 0;
            }
          }

          & > td {
            padding: 9px 14px;
            &:last-child {
              width: 20px;
              border-right: 0;
              text-align: left;
            }
          }
        }
      }
    }
  }
</style>
