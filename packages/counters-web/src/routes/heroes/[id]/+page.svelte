<script lang="ts">
	import HeroBanner from './_components/HeroBanner.svelte';
	import TagCloud from './_components/TagCloud.svelte';
	import MatchupBadge from '$lib/components/MatchupBadge.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.hero.name} — Counters.to</title>
</svelte:head>

<HeroBanner hero={data.hero} />

<TagCloud hero={data.hero} />

<div class="playbook">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- htmlContent is rendered from our own compiled hero markdown, not user input -->
	{@html data.hero.htmlContent}
</div>

<section>
	<h2>Weak To</h2>
	<div class="matchup-grid">
		{#each data.hero.threats as threat (threat.heroId)}
			<MatchupBadge matchup={threat} />
		{/each}
	</div>
</section>

<section>
	<h2>Strong Against</h2>
	<div class="matchup-grid">
		{#each data.hero.advantages as advantage (advantage.heroId)}
			<MatchupBadge matchup={advantage} />
		{/each}
	</div>
</section>

<style>
	.playbook {
		padding: var(--space-4);
		margin-bottom: var(--space-4);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
	}

	.matchup-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
		gap: var(--space-2);
	}
</style>
