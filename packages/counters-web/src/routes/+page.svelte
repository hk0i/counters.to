<script lang="ts">
	import HeroCard from '$lib/components/HeroCard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Counters.to</title>
</svelte:head>

<h1>Heroes</h1>

<div class="hero-grid">
	{#each data.heroes as hero (hero.id)}
		<HeroCard {hero} />
	{/each}
</div>

<style>
	.hero-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 0.75rem;
	}
</style>
