<script lang="ts">
	import { asset } from '$app/paths';
	import type { HeroSummary } from '$lib/types/api';

	let { hero }: { hero: HeroSummary } = $props();
</script>

<div class="hero-banner">
	<img
		class="hero-banner__portrait"
		src={asset(`/images/heroes/${hero.id}.png`)}
		alt=""
		loading="lazy"
	/>
	<div class="hero-banner__text">
		<span class="hero-banner__role">{hero.role}</span>
		<h1 class="hero-banner__name">{hero.name}</h1>
	</div>
</div>

<style>
	.hero-banner {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-4);
		margin-bottom: var(--space-4);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
	}

	.hero-banner__portrait {
		display: block;
		width: 6rem;
		aspect-ratio: 1;
		border-radius: var(--radius-md);
		object-fit: cover;
		background: var(--color-bg);
		flex-shrink: 0;
	}

	.hero-banner__text {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.hero-banner__role {
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		opacity: 0.6;
	}

	.hero-banner__name {
		margin: 0;
	}
</style>
