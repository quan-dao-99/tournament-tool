import type { Team, TeamId } from '../types';

/** Builds a fast id -> name lookup with a safe fallback. */
export function makeNameLookup(teams: readonly Team[]): (id: TeamId | undefined) => string {
  const map = new Map<TeamId, string>();
  for (const team of teams) {
    map.set(team.id, team.name);
  }
  return (id) => (id ? map.get(id) ?? '?' : '?');
}
