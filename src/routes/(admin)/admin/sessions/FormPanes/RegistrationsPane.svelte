<script lang="ts">
  import Pane from '$components/Pane.svelte';

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
</style>
