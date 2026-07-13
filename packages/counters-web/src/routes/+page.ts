import { asset } from '$app/paths';
import type { ApiResponse, HeroSummary } from '$lib/types/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch(asset('/api/v1/heroes/index.json'));
	const { data: heroes }: ApiResponse<HeroSummary[]> = await res.json();

	return { heroes };
};
