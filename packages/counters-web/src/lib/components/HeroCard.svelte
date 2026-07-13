<script lang="ts">
	import { resolve } from '$app/paths';
	import type { HeroSummary } from '$lib/types/api';

	let { hero }: { hero: HeroSummary } = $props();
</script>

<a class="hero-card" href={resolve('/heroes/[id]', { id: hero.id })}>
	<span class="hero-card__role">{hero.role}</span>
	<span class="hero-card__name">{hero.name}</span>
</a>

<style>
	.hero-card {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.75rem 1rem;
		border: 1px solid #ccc;
		border-radius: 0.5rem;
		color: inherit;
		text-decoration: none;
	}

	.hero-card:hover {
		border-color: #888;
	}

	.hero-card__role {
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		opacity: 0.6;
	}

	.hero-card__name {
		font-weight: 600;
	}
</style>
