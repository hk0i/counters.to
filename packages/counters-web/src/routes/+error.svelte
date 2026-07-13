<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status} — Counters.to</title>
</svelte:head>

<h1>{page.status}</h1>
<p>{page.error?.message ?? 'Something went wrong.'}</p>

<a href={resolve('/')}>Back to heroes</a>
