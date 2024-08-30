<script lang="ts">
  import { WeekDaysEnum } from '$lib/schemas';
  import type { PageData } from './$types';
  import AddSessionPane from './FormPanes/AddSessionPane.svelte';

  export let data: PageData;

  $: ({ allSessions, allCategories, sessionForm } = data);

  $: modal = false;
</script>

<AddSessionPane bind:modal eCategories={allCategories} formStore={sessionForm} />

<main class="AdminSessions">
  <header>
    <input type="search" class="CrispInput" placeholder="Search sessions" />
    <span class="Row--center gap-15">
      <button class="CrispButton" data-type="dark-blue" on:click={() => (modal = !modal)}>
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
        <tr>
          <td>{session.name}</td>
          <td>{session.day}</td>
          <td style="display: flex; justify-content: end">
            <button class="CrispButton" data-type="dark-blue" on:click={() => (modal = true)}>
              Edit
            </button>
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
        <!-- <td style="display: flex; justify-content: end">
          <button class="CrispButton" data-type="black-outline"> Update </button>
        </td> -->
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
