<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import { BreadCrumbStore, isEquipmentDeletedStore } from '$store/BreadCrumbStore';
  import { ESecondaryStatus } from '@prisma/client';

  export let data: PageData;

  onMount(() => {
    isEquipmentDeletedStore.set(false);
    BreadCrumbStore.update(() => {
      return [
        {
          name: 'Home',
          path: '/'
        },
        {
          name: 'Equipment',
          path: '/equipment'
        }
      ];
    });
  });

  $: equipmentSearch = '';
  $: categoryFilter = '';

  $: console.log(data.user?.type);
</script>

<main class="Equipment">
  <header class="Equipment__header w-100 gap-15">
    <input
      type="text"
      id="search"
      class="CrispInput"
      bind:value={equipmentSearch}
      placeholder="Search equipment"
      style="--crp-input-width: 270px;"
    />

    <select class="CrispSelect" style="--crp-select-width: 270px;" bind:value={categoryFilter}>
      <option value="">All Categories</option>
      {#each data.categories as item}
        <option value={item.id}>{item.name}</option>
      {/each}
    </select>
  </header>

  <div class="Equipment__content">
    {#each data.allEquipment.filter((item) => {
      // console.log(item);
      if (item.secondaryStatus === ESecondaryStatus.DISABLED) return false;
      // if (data.user?.type === 'STUDENT' && item.onlyForPHDs) return false;
      if (categoryFilter === '') return true;
      return item.eCategoriesId === categoryFilter;
    }) as item (item.id)}
      <a
        href="/equipment/{item.id}"
        class="Equipment__card"
        class:disabled={item.secondaryStatus === ESecondaryStatus.DELETED}
      >
        <i class="CrispMessage" data-type="info" data-format="box">Only for PHDs</i>
        <img src={item.image} alt={item.name} />
        <h2 class="w-100">{item.name}</h2>
        <p class="w-100">{item.model}</p>
        <div class="Equipment__card--buttons">
          <a href="/equipment/{item.id}" class="CrispButton" data-type="black-outline">Book</a>
          <!-- <a href="/equipment/{item.id}" class="CrispButton" data-type="dark-blue">Book</a> -->
        </div>
      </a>
    {/each}
  </div>
</main>

<style lang="scss">
  .Equipment {
    @include make-flex();
    gap: 50px;
    @include box();

    &__header {
      @include make-flex($dir: row, $just: flex-end);
      gap: 15px;

      @include respondAt(535px) {
        flex-direction: column;
        align-items: flex-end;
      }
    }

    &__content {
      @include box();
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 15px;
    }

    &__card {
      gap: 10px;
      padding: 20px;
      @include box();
      background: #fff;
      position: relative;
      border-radius: 10px;
      @include make-flex($just: flex-start);
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
      text-decoration: none;

      &.disabled {
        border: 1px solid var(--darkYellowOrange);

        &::before {
          content: 'Deleted';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 38px;
          font-size: 20px;
          border-radius: 10px 10px 0 0;
          border-bottom: 1px solid var(--darkYellowOrange);
          color: var(--orangeBrown);
          background: var(--yellowOrange);
          @include make-flex($just: center, $align: center);
        }
      }

      &--buttons {
        width: 100%;
        display: flex;
        gap: 10px;

        & > a {
          width: 100%;
          flex: 1;
        }
      }

      & > img {
        border-radius: 7px;
        object-fit: contain;
        @include box(100%, auto);
        aspect-ratio: 1/1;
      }

      & > h2 {
        font-size: 23px;
        font-weight: 600;
      }

      & > a {
        // text-decoration: none !important;
        margin-top: auto;
      }
    }
  }
</style>
