import { asset } from '$app/paths';
import type { ApiResponse, HeroSummary, Registry } from '$lib/types/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const [heroesResponse, registryResponse] = await Promise.all([
		fetch(asset('/api/v1/heroes/index.json')),
		fetch(asset('/api/v1/registry/index.json'))
	]);
	const { data: heroes }: ApiResponse<HeroSummary[]> = await heroesResponse.json();
	const { data: registry }: ApiResponse<Registry> = await registryResponse.json();

	return { heroes, roles: registry.roles };
};
