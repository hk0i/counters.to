<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.hero.name} — Counters.to</title>
</svelte:head>

<p class="role">{data.hero.role}</p>
<h1>{data.hero.name}</h1>

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

<style>
	.role {
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		opacity: 0.6;
	}
</style>
