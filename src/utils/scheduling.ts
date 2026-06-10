import type { Match, RRRound, Team, TeamId } from '../types';

/** Generates a reasonably unique id without external dependencies. */
export function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Returns a new array shuffled with the Fisher-Yates algorithm. */
export function shuffle<T>(input: readonly T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Maximum number of unique round-robin rounds for a given team count. */
export function maxRounds(teamCount: number): number {
  return Math.max(1, teamCount - 1);
}

/**
 * Builds round-robin rounds using the circle method.
 *
 * The team list is shuffled first so pairings are randomised. Across the full
 * `teamCount - 1` rounds every pair meets exactly once; we keep only the first
 * `roundsCount` rounds. Team count is expected to be even.
 */
export function generateRoundRobin(teams: readonly Team[], roundsCount: number): RRRound[] {
  const shuffled = shuffle(teams);
  const n = shuffled.length;
  const totalRounds = n - 1;
  const half = n / 2;

  // Indices into `shuffled`. Index 0 is the fixed pivot; the rest rotate.
  const rotation = shuffled.map((_, i) => i);

  const rounds: RRRound[] = [];
  const roundsToBuild = Math.min(roundsCount, totalRounds);

  for (let r = 0; r < roundsToBuild; r++) {
    const matches: Match[] = [];
    for (let i = 0; i < half; i++) {
      const homeIdx = rotation[i];
      const awayIdx = rotation[n - 1 - i];
      matches.push({
        id: makeId(),
        team1Id: shuffled[homeIdx].id,
        team2Id: shuffled[awayIdx].id,
      });
    }
    rounds.push({ roundNumber: r + 1, matches: shuffle(matches) });

    // Rotate all entries except the pivot at index 0.
    const last = rotation.pop()!;
    rotation.splice(1, 0, last);
  }

  return rounds;
}

/**
 * Pairs an ordered list of qualifying team ids into bracket matches.
 * The qualifiers are shuffled randomly before pairing.
 */
export function generateBracketMatches(qualifierIds: readonly TeamId[]): Match[] {
  const shuffled = shuffle(qualifierIds);
  const matches: Match[] = [];
  for (let i = 0; i + 1 < shuffled.length; i += 2) {
    matches.push({
      id: makeId(),
      team1Id: shuffled[i],
      team2Id: shuffled[i + 1],
    });
  }
  return matches;
}
