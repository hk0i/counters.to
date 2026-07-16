<script lang="ts">
	import { asset } from '$app/paths';

	let { role }: { role: string } = $props();
</script>

<span class="role-icon">
	<img src={asset(`/images/roles/${role}.svg`)} alt="" />
</span>

<style>
	/* Fixed white backing regardless of theme — the source icon (Blizzard's
	   official role glyphs, see NOTICE.md) is solid black artwork with no
	   theme-aware variant, and it's used here completely unaltered (no
	   recoloring/filtering), so a fixed light backdrop is what keeps it
	   legible in dark mode without touching the asset itself. */
	.role-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: var(--radius-full);
		background: var(--color-white);
		flex-shrink: 0;
	}

	.role-icon img {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
