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
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.chip {
		padding: 0.35rem 0.75rem;
		border: 1px solid #ccc;
		border-radius: 999px;
		background: #ffffff;
		color: inherit;
		text-transform: capitalize;
		cursor: pointer;
	}

	.chip.active {
		background: #111111;
		border-color: #111111;
		color: #ffffff;
	}
</style>
