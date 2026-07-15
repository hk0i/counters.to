<script lang="ts">
	import HeroBanner from './_components/HeroBanner.svelte';
	import TagCloud from './_components/TagCloud.svelte';
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
	<ul>
		{#each data.hero.threats as threat (threat.heroId)}
			<li>{threat.heroName} — {threat.matchedTraits.join(', ')}</li>
		{/each}
	</ul>
</section>

<section>
	<h2>Strong Against</h2>
	<ul>
		{#each data.hero.advantages as advantage (advantage.heroId)}
			<li>{advantage.heroName} — {advantage.matchedTraits.join(', ')}</li>
		{/each}
	</ul>
</section>
