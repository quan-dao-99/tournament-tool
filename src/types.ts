export type TeamId = string;

export type TournamentStage =
  | 'setup'
  | 'round-robin'
  | 'quarterfinals'
  | 'semifinals'
  | 'finals'
  | 'complete';

export interface Team {
  id: TeamId;
  name: string;
}

export interface MatchResult {
  winnerId: TeamId;
  /** Total duration of the match in seconds. */
  durationSeconds: number;
}

export interface Match {
  id: string;
  team1Id: TeamId;
  team2Id: TeamId;
  result?: MatchResult;
}

export interface RRRound {
  /** 1-indexed round number. */
  roundNumber: number;
  matches: Match[];
}

export interface FinalsGame {
  winnerId: TeamId;
}

export interface FinalsState {
  team1Id: TeamId;
  team2Id: TeamId;
  /** Up to 3 games (best of 3). */
  games: FinalsGame[];
  /** Set once a team reaches 2 wins. */
  winnerId?: TeamId;
}

export interface TournamentState {
  /** Unique id for this tournament instance. */
  id: string;
  /** Schema version, used when importing saved states. */
  version: number;
  teams: Team[];
  /** Number of round-robin rounds, capped at teams.length - 1. */
  roundsCount: number;
  currentStage: TournamentStage;
  rrRounds: RRRound[];
  /** Exactly 4 matches when present (8 teams). Undefined if QF is skipped. */
  quarterFinalMatches?: Match[];
  /** Exactly 2 matches when present (4 teams). Undefined if SF is skipped. */
  semiFinalMatches?: Match[];
  finalsState?: FinalsState;
  /**
   * Persisted random ordering used to break unresolved ties deterministically.
   * Maps teamId -> random sort key (0..1).
   */
  tieBreakSeed: Record<TeamId, number>;
}

/** Reason a team is ranked above another in the standings. */
export type TieBreakReason = 'wins' | 'headToHead' | 'duration' | 'random' | 'none';

export interface StandingEntry {
  teamId: TeamId;
  rank: number;
  wins: number;
  losses: number;
  played: number;
  /** Sum of durations (seconds) of matches this team won. */
  totalWonDurationSeconds: number;
  /** How this team's position relative to the previous one was decided. */
  tieBreakReason: TieBreakReason;
}

export type Language = 'en' | 'vi';
export type ThemeMode = 'light' | 'dark';
