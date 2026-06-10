import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import type {
  FinalsState,
  Match,
  TeamId,
  TournamentStage,
  TournamentState,
} from '../types';
import { generateBracketMatches, generateRoundRobin, makeId } from '../utils/scheduling';
import {
  computeStandings,
  firstKnockoutStage,
  qualifierCount,
} from '../utils/standings';
import { loadState, saveState, SCHEMA_VERSION } from '../utils/storage';

function createEmptyState(): TournamentState {
  return {
    id: makeId(),
    version: SCHEMA_VERSION,
    teams: [],
    roundsCount: 1,
    currentStage: 'setup',
    rrRounds: [],
    tieBreakSeed: {},
  };
}

export type TournamentAction =
  | { type: 'START_TOURNAMENT'; teamNames: string[]; roundsCount: number }
  | { type: 'SET_RR_RESULT'; matchId: string; winnerId: TeamId; durationSeconds: number }
  | { type: 'CLEAR_RR_RESULT'; matchId: string }
  | { type: 'ADVANCE_FROM_RR' }
  | {
      type: 'SET_BRACKET_RESULT';
      stage: 'quarterfinals' | 'semifinals';
      matchId: string;
      winnerId: TeamId;
      durationSeconds: number;
    }
  | { type: 'CLEAR_BRACKET_RESULT'; stage: 'quarterfinals' | 'semifinals'; matchId: string }
  | { type: 'ADVANCE_FROM_QF' }
  | { type: 'ADVANCE_FROM_SF' }
  | { type: 'SET_FINALS_GAME'; gameIndex: number; winnerId: TeamId }
  | { type: 'CLEAR_FINALS_GAME'; gameIndex: number }
  | { type: 'GO_TO_STAGE'; stage: TournamentStage }
  | { type: 'RESET' }
  | { type: 'LOAD_STATE'; state: TournamentState };

/** Removes everything generated after the round robin. */
function clearAfterRR(): Partial<TournamentState> {
  return { quarterFinalMatches: undefined, semiFinalMatches: undefined, finalsState: undefined };
}

/** Removes everything generated after the quarter finals. */
function clearAfterQF(): Partial<TournamentState> {
  return { semiFinalMatches: undefined, finalsState: undefined };
}

function setMatchResult(
  matches: Match[],
  matchId: string,
  result: Match['result'],
): Match[] {
  return matches.map((m) => (m.id === matchId ? { ...m, result } : m));
}

function computeFinalsWinner(finals: FinalsState): TeamId | undefined {
  let team1Wins = 0;
  let team2Wins = 0;
  for (const game of finals.games) {
    if (game.winnerId === finals.team1Id) team1Wins += 1;
    else if (game.winnerId === finals.team2Id) team2Wins += 1;
  }
  if (team1Wins >= 2) return finals.team1Id;
  if (team2Wins >= 2) return finals.team2Id;
  return undefined;
}

function reducer(state: TournamentState, action: TournamentAction): TournamentState {
  switch (action.type) {
    case 'START_TOURNAMENT': {
      const teams = action.teamNames.map((name) => ({ id: makeId(), name }));
      const tieBreakSeed: Record<TeamId, number> = {};
      for (const team of teams) {
        tieBreakSeed[team.id] = Math.random();
      }
      const roundsCount = Math.min(action.roundsCount, Math.max(1, teams.length - 1));
      const rrRounds = generateRoundRobin(teams, roundsCount);
      return {
        ...createEmptyState(),
        id: makeId(),
        teams,
        roundsCount,
        currentStage: 'round-robin',
        rrRounds,
        tieBreakSeed,
      };
    }

    case 'SET_RR_RESULT': {
      const hasDownstream =
        state.quarterFinalMatches !== undefined ||
        state.semiFinalMatches !== undefined ||
        state.finalsState !== undefined;
      const rrRounds = state.rrRounds.map((round) => ({
        ...round,
        matches: setMatchResult(round.matches, action.matchId, {
          winnerId: action.winnerId,
          durationSeconds: action.durationSeconds,
        }),
      }));
      return {
        ...state,
        rrRounds,
        ...(hasDownstream ? { ...clearAfterRR(), currentStage: 'round-robin' as const } : {}),
      };
    }

    case 'CLEAR_RR_RESULT': {
      const hasDownstream =
        state.quarterFinalMatches !== undefined ||
        state.semiFinalMatches !== undefined ||
        state.finalsState !== undefined;
      const rrRounds = state.rrRounds.map((round) => ({
        ...round,
        matches: setMatchResult(round.matches, action.matchId, undefined),
      }));
      return {
        ...state,
        rrRounds,
        ...(hasDownstream ? { ...clearAfterRR(), currentStage: 'round-robin' as const } : {}),
      };
    }

    case 'ADVANCE_FROM_RR': {
      const standings = computeStandings(state.teams, state.rrRounds, state.tieBreakSeed);
      const count = qualifierCount(state.teams.length);
      const qualifierIds = standings.slice(0, count).map((s) => s.teamId);
      const stage = firstKnockoutStage(state.teams.length);

      if (stage === 'quarterfinals') {
        return {
          ...state,
          currentStage: 'quarterfinals',
          quarterFinalMatches: generateBracketMatches(qualifierIds),
          semiFinalMatches: undefined,
          finalsState: undefined,
        };
      }
      if (stage === 'semifinals') {
        return {
          ...state,
          currentStage: 'semifinals',
          quarterFinalMatches: undefined,
          semiFinalMatches: generateBracketMatches(qualifierIds),
          finalsState: undefined,
        };
      }
      return {
        ...state,
        currentStage: 'finals',
        quarterFinalMatches: undefined,
        semiFinalMatches: undefined,
        finalsState: { team1Id: qualifierIds[0], team2Id: qualifierIds[1], games: [] },
      };
    }

    case 'SET_BRACKET_RESULT': {
      const result = { winnerId: action.winnerId, durationSeconds: action.durationSeconds };
      if (action.stage === 'quarterfinals') {
        const hasDownstream =
          state.semiFinalMatches !== undefined || state.finalsState !== undefined;
        return {
          ...state,
          quarterFinalMatches: setMatchResult(
            state.quarterFinalMatches ?? [],
            action.matchId,
            result,
          ),
          ...(hasDownstream ? { ...clearAfterQF(), currentStage: 'quarterfinals' as const } : {}),
        };
      }
      const hasDownstream = state.finalsState !== undefined;
      return {
        ...state,
        semiFinalMatches: setMatchResult(state.semiFinalMatches ?? [], action.matchId, result),
        ...(hasDownstream ? { finalsState: undefined, currentStage: 'semifinals' as const } : {}),
      };
    }

    case 'CLEAR_BRACKET_RESULT': {
      if (action.stage === 'quarterfinals') {
        const hasDownstream =
          state.semiFinalMatches !== undefined || state.finalsState !== undefined;
        return {
          ...state,
          quarterFinalMatches: setMatchResult(
            state.quarterFinalMatches ?? [],
            action.matchId,
            undefined,
          ),
          ...(hasDownstream ? { ...clearAfterQF(), currentStage: 'quarterfinals' as const } : {}),
        };
      }
      const hasDownstream = state.finalsState !== undefined;
      return {
        ...state,
        semiFinalMatches: setMatchResult(state.semiFinalMatches ?? [], action.matchId, undefined),
        ...(hasDownstream ? { finalsState: undefined, currentStage: 'semifinals' as const } : {}),
      };
    }

    case 'ADVANCE_FROM_QF': {
      const winners = (state.quarterFinalMatches ?? [])
        .map((m) => m.result?.winnerId)
        .filter((id): id is TeamId => Boolean(id));
      return {
        ...state,
        currentStage: 'semifinals',
        semiFinalMatches: generateBracketMatches(winners),
        finalsState: undefined,
      };
    }

    case 'ADVANCE_FROM_SF': {
      const winners = (state.semiFinalMatches ?? [])
        .map((m) => m.result?.winnerId)
        .filter((id): id is TeamId => Boolean(id));
      return {
        ...state,
        currentStage: 'finals',
        finalsState: { team1Id: winners[0], team2Id: winners[1], games: [] },
      };
    }

    case 'SET_FINALS_GAME': {
      if (!state.finalsState) return state;
      const games = state.finalsState.games.slice(0, action.gameIndex);
      games.push({ winnerId: action.winnerId });
      const finalsState: FinalsState = { ...state.finalsState, games };
      const winnerId = computeFinalsWinner(finalsState);
      finalsState.winnerId = winnerId;
      return {
        ...state,
        finalsState,
        currentStage: winnerId ? 'complete' : 'finals',
      };
    }

    case 'CLEAR_FINALS_GAME': {
      if (!state.finalsState) return state;
      const games = state.finalsState.games.slice(0, action.gameIndex);
      const finalsState: FinalsState = { ...state.finalsState, games, winnerId: undefined };
      return { ...state, finalsState, currentStage: 'finals' };
    }

    case 'GO_TO_STAGE':
      return { ...state, currentStage: action.stage };

    case 'RESET':
      return createEmptyState();

    case 'LOAD_STATE':
      return action.state;

    default:
      return state;
  }
}

function initState(): TournamentState {
  return loadState() ?? createEmptyState();
}

interface TournamentContextValue {
  state: TournamentState;
  dispatch: Dispatch<TournamentAction>;
}

const TournamentContext = createContext<TournamentContextValue | undefined>(undefined);

export function TournamentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <TournamentContext.Provider value={{ state, dispatch }}>
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament(): TournamentContextValue {
  const ctx = useContext(TournamentContext);
  if (!ctx) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return ctx;
}

export { createEmptyState };
