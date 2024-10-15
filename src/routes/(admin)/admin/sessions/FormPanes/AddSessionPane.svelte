<script lang="ts">
  import Pane from '$components/Pane.svelte';
  import WeekDay from '$components/WeekDay.svelte';
  import nanoid from '$lib/nanoid';
  import { WeekDaysEnum, type ECategoriesSchema, type ETrainingSessionSchema } from '$lib/schemas';
  import { addToast } from '$store/ToastStore';
  import type { SuperValidated } from 'sveltekit-superforms';
  import { superForm } from 'sveltekit-superforms';

  export let { eCategories, modal, formStore } = $$props as {
    modal: boolean;
    eCategories: ECategoriesSchema[];
    formStore: SuperValidated<ETrainingSessionSchema>;
  };

  $: console.log(formStore.data);

  const { form: sessionForm, enhance: sessionEnhance } = superForm(formStore, {
    id: 'sessionForm',
    dataType: 'json',
    onSubmit() {
      if ($sessionForm.id !== '') {
        console.log('Updating session');
        sessionForm.set({
          id: $sessionForm.id,
          name: $sessionForm.name,
          day: $sessionForm.day,
          categoryIds: $sessionForm.categoryIds
        });
      } else {
        console.log('Creating session');
        sessionForm.set({
          id: nanoid(),
          name: $sessionForm.name,
          day: $sessionForm.day,
          categoryIds: $sessionForm.categoryIds
        });
      }
      modal = false;
    },
    onResult(event) {
      if (event.result.status === 200) {
        addToast({
          message:
            $sessionForm.id !== undefined
              ? 'Session Updated Successfully'
              : 'Session Added Successfully',
          type: 'success'
        });
      }
    },
    taintedMessage: null
  });

  $: isEdit = $sessionForm.id !== undefined;
  $: console.log($sessionForm.name);
</script>

<Pane bind:open={modal} style="--paneWidth: 450px;" on:close={() => (modal = false)}>
  <p slot="header">
    {isEdit ? 'Edit' : 'Add'} Training Session
  </p>
  <!-- svelte-ignore missing-declaration -->
  <svelte:fragment slot="main">
    <form
      method="POST"
      id="sessionForm"
      use:sessionEnhance
      class="SessionForm Col--center gap-10 w-100"
      style="overflow: hidden;"
      action="/admin/sessions?/upsertSession"
    >
      <label class="CrispLabel" for="name">
        <span data-mandatory style="color: inherit;"> Name </span>
        <input
          id="name"
          type="text"
          name="name"
          class="CrispInput"
          style="--crp-input-width: 100%"
          bind:value={$sessionForm.name}
          aria-invalid={$sessionForm.name ? 'true' : undefined}
        />
      </label>
      <label class="CrispLabel" for="day">
        <span data-mandatory style="color: inherit;"> Select day </span>
        <WeekDay bind:days={$sessionForm.day} single={true} />
      </label>
      <label class="CrispLabel" for="categories">
        <span data-mandatory style="color: inherit;"> Start time </span>
        <ul class="SessionForm__ul">
          {#each eCategories as category}
            <label class="SessionForm__item">
              <input
                type="checkbox"
                name={category.name}
                value={category.id}
                bind:group={$sessionForm.categoryIds}
              />
              <span>
                {category.name}
              </span>
            </label>
          {/each}
        </ul>
      </label>
    </form>
  </svelte:fragment>
  <svelte:fragment slot="footer">
    <button class="CrispButton" form="sessionForm" style="--height: 30px" data-type="black-outline">
      {isEdit ? 'Update' : 'Create'}
    </button>
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
