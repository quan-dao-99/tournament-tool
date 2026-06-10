import type {
  FinalsState,
  Match,
  RRRound,
  TournamentStage,
  TournamentState,
} from '../types';

export const STORAGE_KEY = 'tournament-tool-state';
export const SCHEMA_VERSION = 1;

const STAGES: TournamentStage[] = [
  'setup',
  'round-robin',
  'quarterfinals',
  'semifinals',
  'finals',
  'complete',
];

export function saveState(state: TournamentState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage quota / access errors
  }
}

export function loadState(): TournamentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return parseTournament(raw);
  } catch {
    return null;
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function serialize(state: TournamentState): string {
  return JSON.stringify(state, null, 2);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function validateMatch(value: unknown): value is Match {
  if (!isObject(value)) {
    return false;
  }
  if (typeof value.id !== 'string') return false;
  if (typeof value.team1Id !== 'string') return false;
  if (typeof value.team2Id !== 'string') return false;
  if (value.result !== undefined) {
    if (!isObject(value.result)) return false;
    if (typeof value.result.winnerId !== 'string') return false;
    if (typeof value.result.durationSeconds !== 'number') return false;
  }
  return true;
}

function validateRRRound(value: unknown): value is RRRound {
  if (!isObject(value)) return false;
  if (typeof value.roundNumber !== 'number') return false;
  if (!Array.isArray(value.matches)) return false;
  return value.matches.every(validateMatch);
}

function validateFinals(value: unknown): value is FinalsState {
  if (!isObject(value)) return false;
  if (typeof value.team1Id !== 'string') return false;
  if (typeof value.team2Id !== 'string') return false;
  if (!Array.isArray(value.games)) return false;
  return value.games.every(
    (g) => isObject(g) && typeof (g as { winnerId: unknown }).winnerId === 'string',
  );
}

/**
 * Parses and validates a tournament state from a JSON string.
 * Throws if the data is missing required fields or is malformed.
 */
export function parseTournament(raw: string): TournamentState {
  const data: unknown = JSON.parse(raw);
  if (!isObject(data)) {
    throw new Error('Tournament data must be an object.');
  }

  if (typeof data.id !== 'string') throw new Error('Missing id.');
  if (typeof data.roundsCount !== 'number') throw new Error('Missing roundsCount.');
  if (typeof data.currentStage !== 'string' || !STAGES.includes(data.currentStage as TournamentStage)) {
    throw new Error('Invalid currentStage.');
  }
  if (!Array.isArray(data.teams)) throw new Error('Missing teams.');
  const teamsValid = data.teams.every(
    (t) => isObject(t) && typeof t.id === 'string' && typeof t.name === 'string',
  );
  if (!teamsValid) throw new Error('Invalid teams.');

  if (!Array.isArray(data.rrRounds) || !data.rrRounds.every(validateRRRound)) {
    throw new Error('Invalid rrRounds.');
  }

  if (data.quarterFinalMatches !== undefined) {
    if (!Array.isArray(data.quarterFinalMatches) || !data.quarterFinalMatches.every(validateMatch)) {
      throw new Error('Invalid quarterFinalMatches.');
    }
  }
  if (data.semiFinalMatches !== undefined) {
    if (!Array.isArray(data.semiFinalMatches) || !data.semiFinalMatches.every(validateMatch)) {
      throw new Error('Invalid semiFinalMatches.');
    }
  }
  if (data.finalsState !== undefined && !validateFinals(data.finalsState)) {
    throw new Error('Invalid finalsState.');
  }

  const tieBreakSeed = isObject(data.tieBreakSeed)
    ? (data.tieBreakSeed as Record<string, number>)
    : {};

  return {
    id: data.id,
    version: typeof data.version === 'number' ? data.version : SCHEMA_VERSION,
    teams: data.teams as TournamentState['teams'],
    roundsCount: data.roundsCount,
    currentStage: data.currentStage as TournamentStage,
    rrRounds: data.rrRounds as RRRound[],
    quarterFinalMatches: data.quarterFinalMatches as Match[] | undefined,
    semiFinalMatches: data.semiFinalMatches as Match[] | undefined,
    finalsState: data.finalsState as FinalsState | undefined,
    tieBreakSeed,
  };
}
