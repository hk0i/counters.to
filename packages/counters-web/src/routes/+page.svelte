<script lang="ts">
	import HeroCard from '$lib/components/HeroCard.svelte';
	import RoleFilterBar from './_components/RoleFilterBar.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let selectedRole = $state<string | null>(null);
	let searchQuery = $state('');

	let filteredHeroes = $derived(
		data.heroes.filter((hero) => {
			const matchesRole = selectedRole === null || hero.role === selectedRole;
			const matchesSearch = hero.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
			return matchesRole && matchesSearch;
		})
	);
</script>

<svelte:head>
	<title>Counters.to</title>
</svelte:head>

<h1>Heroes</h1>

<RoleFilterBar
	roles={data.roles}
	selected={selectedRole}
	onSelect={(role) => (selectedRole = role)}
/>

<input
	type="search"
	placeholder="Search heroes…"
	aria-label="Search heroes by name"
	bind:value={searchQuery}
/>

<div class="hero-grid">
	{#each filteredHeroes as hero (hero.id)}
		<HeroCard {hero} />
	{/each}
</div>

<style>
	input[type='search'] {
		display: block;
		margin: 0.75rem 0;
		padding: 0.4rem 0.6rem;
		width: 100%;
		max-width: 20rem;
		border: 1px solid var(--color-border);
		border-radius: 0.375rem;
		background: var(--color-surface);
		color: inherit;
	}

	.hero-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 0.75rem;
	}
</style>
