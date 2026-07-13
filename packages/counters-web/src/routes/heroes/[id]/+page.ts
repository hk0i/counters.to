import fs from 'node:fs';
import path from 'node:path';
import { error } from '@sveltejs/kit';
import { asset } from '$app/paths';
import type { ApiResponse, HeroDetail } from '$lib/types/api';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => {
	const indexPath = path.join(process.cwd(), 'static', 'api', 'v1', 'heroes', 'index.json');
	const { data: heroes }: ApiResponse<{ id: string }[]> = JSON.parse(
		fs.readFileSync(indexPath, 'utf8')
	);

	return heroes.map((hero) => ({ id: hero.id }));
};

export const load: PageLoad = async ({ fetch, params }) => {
	const res = await fetch(asset(`/api/v1/heroes/${params.id}/index.json`));
	if (!res.ok) {
		error(404, 'Hero not found');
	}

	const { data: hero }: ApiResponse<HeroDetail> = await res.json();

	return { hero };
};
