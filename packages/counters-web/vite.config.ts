import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// Deploying to the GitHub Pages project-page subpath for now
			// (no custom domain wired up yet) — swap back to '' once DNS for
			// counters.to is pointed at Pages and static/CNAME is added.
			paths: {
				base: '/counters.to'
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
				// propagated into Vite's resolved config, so the home page's
				// precache entry silently falls back to "/" instead of
				// "/counters.to" — which 404s under this subpath deploy and
				// fails the whole service worker install. Setting this
				// explicitly is the working fix.
				base: '/counters.to'
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
						// Not startsWith — the app is currently served from the
						// /counters.to subpath (see the base path above), so this
						// needs to match regardless of base prefix.
						urlPattern: ({ url }) => url.pathname.includes('/api/v1/'),
						handler: 'StaleWhileRevalidate',
						options: {
							cacheName: 'api-v1'
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
