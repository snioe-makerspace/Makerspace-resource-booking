<script lang="ts">
  import Pane from '$components/Pane.svelte';
  import WeekDay from '$components/WeekDay.svelte';
  import WeekDays from '$components/WeekDays.svelte';
  import nanoid from '$lib/nanoid';
  import {
    WeekDaysEnum,
    type ECategoriesSchema,
    type ETrainingSessionSchema,
    type UserProfileSchema
  } from '$lib/schemas';
  import { addToast } from '$store/ToastStore';
  import type { SuperValidated } from 'sveltekit-superforms';
  import { superForm } from 'sveltekit-superforms';

  export let { modal, registeredUsers, sessionID } = $$props as {
    modal: boolean;
    registeredUsers: any[];
    sessionID: string;
  };

  $: registeredUsers = registeredUsers.filter((user) => user.sessionId === sessionID);

  $: console.log(sessionID);
</script>

<Pane bind:open={modal} style="--paneWidth: 450px;" on:close={() => (modal = false)}>
  <p slot="header">Registrations for SessionName</p>
  <svelte:fragment slot="main">
    <table class="FancyTable">
      <thead>
        <tr>
          <th>Name</th>
          <th>Roll No.</th>
        </tr>
      </thead>
      <tbody>
        {#if registeredUsers && registeredUsers.length === 0}
          <tr>
            <td colspan="2">No users found</td>
          </tr>
        {:else}
          {#each registeredUsers as user}
            <tr>
              <td>{user.user.name}</td>
              <td>{user.user.type === 'STUDENT' ? user.user.typeData.studentId : '-'}</td>
            </tr>
          {/each}
        {/if}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2"> Showing {registeredUsers.length || 0} user(s) </td>
        </tr>
      </tfoot>
    </table>
  </svelte:fragment>
</Pane>

<style lang="scss">
  .SessionForm {
    &__ul {
      list-style: none;
      @include make-flex($dir: column, $align: flex-start);
      gap: 10px;

      & > label {
        @include box(auto, auto);

        & > span {
          font-size: 14px;
          color: #868686;
          @include make-flex();
          user-select: none;
          cursor: pointer;

          @include box(auto, 30px);
          padding: 0 10px;
          border-radius: 8px;
          position: relative;
          border: 1px solid #d6d6d6;

          transition: all 0.1s ease-in-out;
        }

        & > input {
          display: none;

          &:checked + span {
            border: 1px solid var(--darkBlue);
            background-color: var(--darkBlue);
            color: var(--lightBlue);
          }
        }
      }
    }
  }
</style>
