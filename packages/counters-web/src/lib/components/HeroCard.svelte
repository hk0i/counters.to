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
		gap: var(--space-1);
		padding: var(--space-3) var(--space-4);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		color: inherit;
		text-decoration: none;
	}

	.hero-card:hover {
		border-color: var(--color-border-hover);
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
