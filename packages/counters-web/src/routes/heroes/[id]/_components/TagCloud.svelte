<script lang="ts">
	import type { HeroDetail } from '$lib/types/api';

	let { hero }: { hero: HeroDetail } = $props();

	type TagCategory = 'archetype' | 'tag' | 'damage-type' | 'mechanic';

	let tags = $derived([
		{ label: hero.strategy.archetype, category: 'archetype' as const },
		...hero.strategy.tags.map((label) => ({ label, category: 'tag' as const })),
		...hero.damageTypes.map((label) => ({ label, category: 'damage-type' as const })),
		...hero.mechanics.map((label) => ({ label, category: 'mechanic' as const }))
	] satisfies { label: string; category: TagCategory }[]);
</script>

<ul class="tag-cloud">
	{#each tags as tag (tag.category + ':' + tag.label)}
		<li class="tag tag--{tag.category}">{tag.label}</li>
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

	/* Archetype: green (Success). */
	.tag--archetype {
		background: var(--color-success-bg);
		border-color: var(--color-success-border);
		color: var(--color-success-text);
	}

	/* Strategy tags keep the plain default pill styling above — the
	   catch-all category, so it stays visually "neutral default" rather
	   than competing with the three more specific ones. */

	/* Damage type: red (Error). */
	.tag--damage-type {
		background: var(--color-error-bg);
		border-color: var(--color-error-border);
		color: var(--color-error-text);
	}

	/* Mechanics: a second, darker neutral tier rather than an added hue —
	   the palette has no blue, and this reads as "still neutral, but
	   distinct from the default tag pill" without introducing an
	   off-palette color. */
	.tag--mechanic {
		background: var(--color-neutral-alt-bg);
		border-color: var(--color-neutral-alt-border);
	}
</style>
