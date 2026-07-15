<script lang="ts">
	import type { HeroDetail } from '$lib/types/api';

	let { hero }: { hero: HeroDetail } = $props();

	let tags = $derived([
		hero.strategy.archetype,
		...hero.strategy.tags,
		...hero.damageTypes,
		...hero.mechanics
	]);
</script>

<ul class="tag-cloud">
	{#each tags as tag (tag)}
		<li class="tag">{tag}</li>
	{/each}
</ul>

<style>
	.tag-cloud {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin: 0 0 var(--space-4);
		padding: 0;
		list-style: none;
	}

	.tag {
		padding: var(--space-1) var(--space-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		background: var(--color-surface);
		font-size: 0.75rem;
	}
</style>
