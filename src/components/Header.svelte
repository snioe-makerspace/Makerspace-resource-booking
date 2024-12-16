<script lang="ts">
  import HomeNavigation from '$components/HomeNavigation.svelte';
  import Google from '$components/Google.svelte';

  export let { pathname } = $$props as {
    pathname: string;
  };

  $: console.log(pathname);
</script>

<header class="HeaderWrapper">
  <div class="Header">
    <div class="Header__left">
      <a href="/" class="Header__logo">
        <img src="/assets/images/snu_logo.svg" alt="snu Logo" />
        <hr />
        <img src="/assets/images/logo.svg" alt="Logo" />
      </a>
    </div>
    <ul class="Header__links">
      <li class={`${pathname === '' && 'Header__links--active'}`}>
        <a href="/">Home</a>
      </li>
      <li class={`${pathname === 'modules' && 'Header__links--active'}`}>
        <a href="/learning-modules">Modules</a>
      </li>
      <li class={`${pathname === 'events' && 'Header__links--active'}`}>
        <a href="/events">Events</a>
      </li>
      <li class={`${pathname === 'contact' && 'Header__links--active'}`}>
        <a href="/contact">Contact</a>
      </li>
      <li class={`${pathname === 'archive' && 'Header__links--active'}`}>
        <a href="/archive">Archive</a>
      </li>
      <li class={`${pathname === 'equipment' && 'Header__links--active'}`}>
        <a href="/equipment">Equipments</a>
      </li>
    </ul>
    <div class="Header__right">
      <HomeNavigation {pathname} isHeader={true} />
      <Google />
    </div>
  </div>
</header>

<style lang="scss">
  .HeaderWrapper {
    top: 0;
    left: 0;
    right: 0;
    gap: 10px;
    z-index: 5;
    position: fixed;
    @include box(100%, 64px);
    background: #ffffff;
    box-shadow: 0px 4px 14px 0px rgba(0, 0, 0, 0.06);
    backdrop-filter: blur(5px);
    @include make-flex();
  }
  .Header {
    align-items: center;
    @include box();
    max-width: $maxWidth;
    @include make-flex($dir: row, $just: space-between);
    gap: 15px;
    padding: 16px 20px;

    &__logo {
      @include make-flex($dir: row, $just: flex-start, $align: center);
      gap: 10px;
      @include box(auto);
      & > img {
        @include box(auto, 25px);

        &:first-child {
          @include respondAt(500px) {
            display: none;
          }
        }
      }
      & > hr {
        @include box(1px, 40px);
        background: var(--iconColor);
        border: none;
        @include respondAt(500px) {
          display: none;
        }
      }
    }

    &__left {
      @include make-flex($dir: row, $just: flex-start);
      @include box(100%, auto);
    }

    &__links {
      @include make-flex($dir: row, $just: center);
      gap: 15px;
      @include box(100%, auto);
      & > li {
        @include box(auto, auto);
        list-style: none;

        & > a {
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--textColor);
          text-decoration: none;
          transition: color 0.3s;
          &:hover {
            color: #003f75;
          }
        }
      }

      &--active {
        & > a {
          color: #003f75 !important;
        }
      }
    }

    &__right {
      @include make-flex($dir: row, $just: flex-end);
      @include box(100%, auto);
    }

    &__right,
    &__left {
      gap: 15px;
    }
  }
</style>
