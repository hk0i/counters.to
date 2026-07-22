<script lang="ts">
	import { resolve } from '$app/paths';

	const year = new Date().getFullYear();
</script>

<footer class="site-footer">
	<p>
		© {year} counters.to. Overwatch is a trademark or registered trademark of Blizzard Entertainment,
		Inc. — see <a href={resolve('/about')}>About</a> for full attribution.
	</p>
	<p><a href="https://github.com/hk0i/counters.to">Source on GitHub</a></p>
</footer>

<style>
	.site-footer {
		margin-top: var(--space-6);
		padding: var(--space-4);
		border-top: 1px solid var(--color-border);
		color: var(--color-text);
		opacity: 0.7;
		font-size: 0.75rem;
		text-align: center;
	}

	.site-footer p {
		margin: 0 0 var(--space-1);
	}

	.site-footer p:last-child {
		margin-bottom: 0;
	}
</style>
