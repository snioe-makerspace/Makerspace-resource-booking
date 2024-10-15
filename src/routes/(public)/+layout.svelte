<script>
  import Header from '$components/Header.svelte';
  import RegisterButton from '$components/RegisterButton.svelte';
  export let data;

  // This is the layout for all (public) group routes.
</script>

<Header pathname={data.pathname} />
<RegisterButton />
<slot />
