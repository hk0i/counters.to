<script lang="ts">
	import RoleIcon from '$lib/components/RoleIcon.svelte';

	let {
		roles,
		selected,
		onSelect
	}: {
		roles: string[];
		selected: string | null;
		onSelect: (role: string | null) => void;
	} = $props();
</script>

<div class="role-filter" role="group" aria-label="Filter by role">
	<button
		type="button"
		class="chip"
		class:active={selected === null}
		onclick={() => onSelect(null)}
	>
		All
	</button>
	{#each roles as role (role)}
		<button
			type="button"
			class="chip"
			class:active={selected === role}
			onclick={() => onSelect(role)}
		>
			<RoleIcon {role} />
			{role}
		</button>
	{/each}
</div>

<style>
	.role-filter {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}

	/* Below this, four full-size chips don't reliably fit on one line.
	   Scroll sideways instead of wrapping, so nothing looks orphaned or
	   gets squished — a partially cut-off chip at the edge is the
	   scroll affordance. */
	@media (max-width: 480px) {
		.role-filter {
			flex-wrap: nowrap;
			overflow-x: auto;
			padding-bottom: var(--space-1);
		}
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-4);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		background: var(--color-surface);
		color: inherit;
		text-transform: capitalize;
		cursor: pointer;
		flex-shrink: 0;
	}

	.chip.active {
		background: var(--color-primary);
		border-color: var(--color-primary);
		color: var(--color-on-primary);
	}
</style>
