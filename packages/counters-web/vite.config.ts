import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

// Root ('') is correct everywhere this app is actually served: local dev
// (vite dev/preview), the Docker/nginx-proxy local environment (EDD section
// 8), and the live counters.to custom domain all serve from the root.
// BASE_PATH exists as an override knob for the GitHub Actions build only,
// used temporarily while counters.to's DNS/custom domain wasn't set up yet
// (the site briefly lived at the GitHub Pages project-page subpath
// /counters.to instead) — the workflow no longer sets it, but the mechanism
// stays in case a subpath deploy is ever needed again.
const rawBase = process.env.BASE_PATH ?? '';
if (rawBase !== '' && !rawBase.startsWith('/')) {
	throw new Error(`BASE_PATH must be empty or start with "/", got: "${rawBase}"`);
}
const base = rawBase as '' | `/${string}`;

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			paths: {
				base
			},
			adapter: adapter({
				// Every real route is prerendered (strict mode stays on), but GitHub
				// Pages needs an actual 404.html to serve for genuinely bogus URLs —
				// see EDD section 5.
				fallback: '404.html'
			})
		}),
		SvelteKitPWA({
			kit: {
				// Mirror the adapter-static fallback above so the precache manifest
				// accounts for it correctly.
				adapterFallback: '404.html',
				// `kit.base` is documented as deprecated ("Vite's base is now
				// properly configured"), but in practice the plugin still reads
				// its own internal base before SvelteKit's paths.base has
				// propagated into Vite's resolved config, so without this the
				// home page's precache entry silently falls back to "/"
				// regardless of the real base — which 404s under a subpath
				// deploy and fails the whole service worker install.
				//
				// Root deploys need `|| '/'`, not the raw (empty) base: the
				// plugin maps index.html's precache entry directly to this
				// value, and an empty-string precache URL breaks Workbox's
				// install silently — registration still reaches "activated",
				// but nothing actually gets cached (confirmed by killing the
				// origin server and finding the app didn't work offline).
				// SvelteKit's own paths.base above must stay '' for root
				// (not '/', which would double up leading slashes in
				// asset()/resolve() output) — this is a separate, PWA-plugin-
				// only value that just needs to be non-empty.
				base: base || '/'
			},
			registerType: 'autoUpdate',
			manifest: {
				name: 'Counters.to',
				short_name: 'Counters.to',
				description:
					'Overwatch counter-picking reference — see what a hero is weak to and what beats it.',
				theme_color: '#111111',
				background_color: '#ffffff',
				// Placeholder icons pending real branding/portrait art (EDD section 10.3
				// blocks that the same way it blocks hero card portraits).
				icons: [
					{ src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
					{ src: 'icon-512.png', sizes: '512x512', type: 'image/png' }
				]
			},
			workbox: {
				// EDD section 4.5: precache the prerendered app shell (every route is
				// static HTML at build time, so this covers the whole MVP experience).
				globPatterns: ['**/*.{html,js,css,ico,png,svg,webmanifest}'],
				// EDD section 4.5: runtime-cache the compiled JSON API,
				// stale-while-revalidate since it only changes on redeploy.
				runtimeCaching: [
					{
						// Not startsWith — base above may or may not be a subpath
						// depending on the build target, so this needs to match
						// regardless of base prefix.
						urlPattern: ({ url }) => url.pathname.includes('/api/v1/'),
						handler: 'StaleWhileRevalidate',
						options: {
							cacheName: 'api-v1'
						}
					},
					{
						// @fontsource/rubik ships every script subset per weight,
						// split by unicode-range, so eagerly precaching them all
						// (globPatterns above) would pull down glyphs this
						// latin-only app never uses. CacheFirst instead: once the
						// browser fetches the one subset it actually needs, that
						// hashed/immutable file is cached for offline reuse.
						urlPattern: ({ url }) => url.pathname.endsWith('.woff2'),
						handler: 'CacheFirst',
						options: {
							cacheName: 'fonts'
						}
					}
				]
			}
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},

			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
