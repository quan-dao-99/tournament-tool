import type {
  Match,
  RRRound,
  StandingEntry,
  Team,
  TeamId,
  TieBreakReason,
  TournamentStage,
} from '../types';

interface TeamStats {
  teamId: TeamId;
  wins: number;
  losses: number;
  played: number;
  totalWonDurationSeconds: number;
}

/** Collects every played (result-bearing) match from the round-robin rounds. */
export function collectRRMatches(rrRounds: readonly RRRound[]): Match[] {
  return rrRounds.flatMap((round) => round.matches);
}

function computeStats(teams: readonly Team[], matches: readonly Match[]): Map<TeamId, TeamStats> {
  const stats = new Map<TeamId, TeamStats>();
  for (const team of teams) {
    stats.set(team.id, {
      teamId: team.id,
      wins: 0,
      losses: 0,
      played: 0,
      totalWonDurationSeconds: 0,
    });
  }

  for (const match of matches) {
    if (!match.result) {
      continue;
    }
    const { winnerId, durationSeconds } = match.result;
    const loserId = winnerId === match.team1Id ? match.team2Id : match.team1Id;
    const winner = stats.get(winnerId);
    const loser = stats.get(loserId);
    if (winner) {
      winner.wins += 1;
      winner.played += 1;
      winner.totalWonDurationSeconds += durationSeconds;
    }
    if (loser) {
      loser.losses += 1;
      loser.played += 1;
    }
  }

  return stats;
}

/**
 * Counts, for each team in `group`, how many matches it won against other
 * members of the same group (the head-to-head mini-table).
 */
function headToHeadWins(
  group: readonly TeamStats[],
  matches: readonly Match[],
): Map<TeamId, number> {
  const groupIds = new Set(group.map((s) => s.teamId));
  const h2h = new Map<TeamId, number>();
  for (const s of group) {
    h2h.set(s.teamId, 0);
  }
  for (const match of matches) {
    if (!match.result) {
      continue;
    }
    const { winnerId } = match.result;
    const loserId = winnerId === match.team1Id ? match.team2Id : match.team1Id;
    if (groupIds.has(winnerId) && groupIds.has(loserId)) {
      h2h.set(winnerId, (h2h.get(winnerId) ?? 0) + 1);
    }
  }
  return h2h;
}

/**
 * Produces the ranked standings for the round robin.
 *
 * Ordering criteria, in priority order:
 *   1. Most wins.
 *   2. Head-to-head mini-table among teams tied on wins.
 *   3. Lowest total winning duration.
 *   4. Random draw (stable via the stored tie-break seed).
 */
export function computeStandings(
  teams: readonly Team[],
  rrRounds: readonly RRRound[],
  tieBreakSeed: Record<TeamId, number>,
): StandingEntry[] {
  const matches = collectRRMatches(rrRounds);
  const statsMap = computeStats(teams, matches);
  const allStats = teams.map((t) => statsMap.get(t.id)!);

  // Group by win count (descending).
  const byWins = [...allStats].sort((a, b) => b.wins - a.wins);
  const groups: TeamStats[][] = [];
  for (const s of byWins) {
    const last = groups[groups.length - 1];
    if (last && last[0].wins === s.wins) {
      last.push(s);
    } else {
      groups.push([s]);
    }
  }

  const ordered: { stats: TeamStats; h2h: number }[] = [];
  for (const group of groups) {
    const h2h = headToHeadWins(group, matches);
    const sorted = [...group].sort((a, b) => {
      const h2hDiff = (h2h.get(b.teamId) ?? 0) - (h2h.get(a.teamId) ?? 0);
      if (h2hDiff !== 0) {
        return h2hDiff;
      }
      const durDiff = a.totalWonDurationSeconds - b.totalWonDurationSeconds;
      if (durDiff !== 0) {
        return durDiff;
      }
      return (tieBreakSeed[a.teamId] ?? 0) - (tieBreakSeed[b.teamId] ?? 0);
    });
    for (const s of sorted) {
      ordered.push({ stats: s, h2h: h2h.get(s.teamId) ?? 0 });
    }
  }

  // Assign ranks and the reason each team ranks above the one below it.
  // A non-'wins' reason means those two teams were tied on wins and a
  // secondary criterion separated them — the chip belongs on the team that
  // *benefited* from the tiebreak (the higher-ranked one), not the one that lost.
  const entries: StandingEntry[] = ordered.map((entry, index) => ({
    teamId: entry.stats.teamId,
    rank: index + 1,
    wins: entry.stats.wins,
    losses: entry.stats.losses,
    played: entry.stats.played,
    totalWonDurationSeconds: entry.stats.totalWonDurationSeconds,
    tieBreakReason: 'none' as TieBreakReason,
  }));

  for (let i = 1; i < ordered.length; i++) {
    const above = ordered[i - 1];
    const below = ordered[i];
    let reason: TieBreakReason;
    if (above.stats.wins !== below.stats.wins) {
      reason = 'wins';
    } else if (above.h2h !== below.h2h) {
      reason = 'headToHead';
    } else if (above.stats.totalWonDurationSeconds !== below.stats.totalWonDurationSeconds) {
      reason = 'duration';
    } else {
      reason = 'random';
    }
    // Attach the reason to the higher-ranked team (the tiebreak winner).
    entries[i - 1].tieBreakReason = reason;
  }

  return entries;
}

/**
 * Number of teams that advance from the round robin.
 *
 * A knockout stage is only used when it requires strictly fewer teams than the
 * total, so the round robin always eliminates at least one team. With exactly
 * 8 teams there is no quarter final (it would need all 8); with exactly 4 there
 * is no semi final.
 */
export function qualifierCount(teamCount: number): number {
  if (teamCount > 8) {
    return 8;
  }
  if (teamCount > 4) {
    return 4;
  }
  return 2;
}

/** The first knockout stage played, based on team count. */
export function firstKnockoutStage(teamCount: number): TournamentStage {
  if (teamCount > 8) {
    return 'quarterfinals';
  }
  if (teamCount > 4) {
    return 'semifinals';
  }
  return 'finals';
}
