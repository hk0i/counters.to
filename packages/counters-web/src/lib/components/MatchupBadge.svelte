<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import type { MatchedTrait } from '$lib/types/api';

	let { matchup }: { matchup: MatchedTrait } = $props();
</script>

<a class="matchup" href={resolve('/heroes/[id]', { id: matchup.heroId })}>
	<img
		class="matchup__portrait"
		src={asset(`/images/heroes/${matchup.heroId}.png`)}
		alt=""
		loading="lazy"
	/>
	<div class="matchup__text">
		<span class="matchup__name">{matchup.heroName}</span>
		<span class="matchup__traits">{matchup.matchedTraits.join(', ')}</span>
	</div>
</a>

<style>
	.matchup {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		color: inherit;
		text-decoration: none;
	}

	.matchup:hover {
		border-color: var(--color-border-hover);
	}

	.matchup__portrait {
		display: block;
		width: 2.5rem;
		aspect-ratio: 1;
		border-radius: var(--radius-sm);
		object-fit: cover;
		background: var(--color-bg);
		flex-shrink: 0;
	}

	.matchup__text {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		min-width: 0;
	}

	.matchup__name {
		font-weight: 600;
	}

	.matchup__traits {
		font-size: 0.75rem;
		opacity: 0.6;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
