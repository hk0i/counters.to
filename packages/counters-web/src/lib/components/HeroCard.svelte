<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import RoleIcon from '$lib/components/RoleIcon.svelte';
	import type { HeroSummary } from '$lib/types/api';

	let { hero }: { hero: HeroSummary } = $props();
</script>

<a class="hero-card" href={resolve('/heroes/[id]', { id: hero.id })}>
	<img
		class="hero-card__portrait"
		src={asset(`/images/heroes/${hero.id}.png`)}
		alt=""
		loading="lazy"
	/>
	<div class="hero-card__text">
		<span class="hero-card__name">{hero.name}</span>
		<span class="hero-card__role">
			<RoleIcon role={hero.role} />
			{hero.role}
		</span>
	</div>
</a>

<style>
	.hero-card {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		color: inherit;
		text-decoration: none;
		overflow: hidden;
	}

	.hero-card:hover {
		border-color: var(--color-border-hover);
	}

	.hero-card__portrait {
		display: block;
		width: 100%;
		aspect-ratio: 1;
		object-fit: cover;
		background: var(--color-bg);
	}

	.hero-card__text {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding: var(--space-3) var(--space-4);
	}

	.hero-card__role {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		opacity: 0.6;
	}

	.hero-card__name {
		font-weight: 600;
	}
</style>
