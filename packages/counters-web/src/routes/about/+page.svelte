<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>About — Counters.to</title>
</svelte:head>

<h1>About Counters.to</h1>

<p>
	Counters.to helps you pick a hero by showing what it's weak to and which heroes exploit that
	weakness — pick an ally, see its threats; pick an enemy, see what beats it.
</p>

<h2>Disclaimer</h2>

<p>
	Counters.to is an unofficial, fan-made project. It is not affiliated with, endorsed by, or
	sponsored by Blizzard Entertainment, Inc. Overwatch, Overwatch 2, and all associated hero names,
	logos, images, and other assets are trademarks and/or copyrighted material of Blizzard
	Entertainment, Inc. Hero profile data on this site consists of original strategic analysis and
	commentary written for this project; it references Blizzard's trademarked hero names and abilities
	for identification purposes only.
</p>

<h2>Licensing</h2>

<p>
	This project is a monorepo with a per-package license split, not one blanket license for the whole
	repo: the data pipeline that compiles hero profiles into this site's API is MIT-licensed, while
	this web app is licensed GPLv3. Full source is available on
	<a href="https://github.com/hk0i/counters.to">GitHub</a>.
</p>

<p><a href={resolve('/')}>Back to heroes</a></p>
