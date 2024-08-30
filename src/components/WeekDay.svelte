<!-- Ref: https://svelte.dev/repl/1565708677134e418e256234984d90ef?version=3.12.1 -->
<script lang="ts">
  import { WeekDaysEnum } from '$lib/schemas';

  export let { days, single, id, blocked } = $$props as {
    days: WeekDaysEnum;
    single?: boolean;
    id?: string;
    blocked?: WeekDaysEnum[];
  };

  const valueOf = (day: string) => {
    return WeekDaysEnum[day as keyof typeof WeekDaysEnum];
  };

  console.log(blocked);
</script>

<ul class="WeekDay">
  {#if single}
    {#each Object.keys(WeekDaysEnum) as day}
      <label class="WeekDay__item" for={id}>
        <input type="radio" {id} name={day} value={valueOf(day)} bind:group={days} />
        <span>
          {day}
        </span>
      </label>
    {/each}
  {/if}
</ul>

<style lang="scss">
  .WeekDay {
    list-style: none;
    @include make-flex($dir: row);
    gap: 10px;

    & > label {
      @include box(auto, auto);

      & > span {
        font-size: 14px;
        color: #868686;
        @include make-flex();
        user-select: none;
        cursor: pointer;

        @include box(30px, 30px);
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
</style>
