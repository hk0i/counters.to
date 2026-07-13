/**
 * Mirrors the JSON shapes written by counters-data-core's compile.ts.
 * Keep in sync with packages/counters-data-core/src/compile.ts's own
 * (unexported) Registry / HeroFrontMatter / CompiledHero / MatchedTrait types.
 */

export interface ApiResponse<T> {
	data: T;
}

export interface Registry {
	roles: string[];
	damageTypes: string[];
	mechanics: string[];
	strategy: {
		archetypes: string[];
		tags: string[];
	};
}

export interface HeroStrategy {
	archetype: string;
	tags: string[];
}

/** GET /api/v1/heroes — one entry per hero, the grid/list view. */
export interface HeroSummary {
	id: string;
	name: string;
	role: string;
	/** ISO-8601 timestamp on the wire (JSON has no native date type). */
	lastUpdated: string;
	damageTypes: string[];
	mechanics: string[];
	strategy: HeroStrategy;
}

export interface MatchedTrait {
	heroId: string;
	heroName: string;
	matchedTraits: string[];
}

/** GET /api/v1/heroes/:id — full profile including relational data and rendered HTML. */
export interface HeroDetail extends HeroSummary {
	weakTo: string[];
	strongTo: string[];
	threats: MatchedTrait[];
	advantages: MatchedTrait[];
	htmlContent: string;
}
