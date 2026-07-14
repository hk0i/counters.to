<script lang="ts">
	import { onlineStatus } from '$lib/state/onlineStatus.svelte';
</script>

{#if !onlineStatus.online}
	<div class="offline-banner" role="status">You're offline — showing the last loaded data.</div>
{/if}

<style>
	.offline-banner {
		padding: 0.5rem 1rem;
		background: var(--color-warning-bg);
		border-bottom: 1px solid var(--color-warning-border);
		text-align: center;
		font-size: 0.875rem;
	}
</style>
