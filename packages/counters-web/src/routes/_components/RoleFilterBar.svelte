<script lang="ts">
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
			{role}
		</button>
	{/each}
</div>

<style>
	.role-filter {
		display: flex;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}

	.chip {
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		background: var(--color-surface);
		color: inherit;
		text-transform: capitalize;
		cursor: pointer;
	}

	.chip.active {
		background: var(--color-primary);
		border-color: var(--color-primary);
		color: var(--color-on-primary);
	}
</style>
