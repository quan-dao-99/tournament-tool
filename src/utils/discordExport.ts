import type { Match, TournamentState } from '../types';
import type { TranslateFn } from '../i18n';
import { makeNameLookup } from './teams';

function formatMatch(
  match: Match,
  getName: (id: string | undefined) => string,
  index: number,
  t: TranslateFn,
): string {
  const team1 = getName(match.team1Id);
  const team2 = getName(match.team2Id);
  const winnerId = match.result?.winnerId;

  if (!winnerId) {
    return `  **${t('bracket.match', { number: index + 1 })}:** ${team1} ${t('common.vs')} ${team2}`;
  }

  const winner = getName(winnerId);
  const loser = winnerId === match.team1Id ? team2 : team1;
  return `  **${t('bracket.match', { number: index + 1 })}:** ~~${loser}~~ → **${winner}** 🏆`;
}

export function buildDiscordMessage(state: TournamentState, t: TranslateFn): string {
  const getName = makeNameLookup(state.teams);
  const lines: string[] = [];
  const stage = state.currentStage;

  if (stage === 'round-robin') {
    lines.push(`## 📋 ${t('rr.heading')}`);
    lines.push('');
    for (const round of state.rrRounds) {
      lines.push(`**${t('rr.round', { number: round.roundNumber })}**`);
      round.matches.forEach((match, i) => {
        lines.push(formatMatch(match, getName, i, t));
      });
      lines.push('');
    }
  } else if (stage === 'quarterfinals' && state.quarterFinalMatches) {
    lines.push(`## ⚔️ ${t('bracket.quarterfinals')}`);
    lines.push('');
    state.quarterFinalMatches.forEach((match, i) => {
      lines.push(formatMatch(match, getName, i, t));
    });
    lines.push('');
  } else if (stage === 'semifinals' && state.semiFinalMatches) {
    lines.push(`## ⚔️ ${t('bracket.semifinals')}`);
    lines.push('');
    state.semiFinalMatches.forEach((match, i) => {
      lines.push(formatMatch(match, getName, i, t));
    });
    lines.push('');
  } else if ((stage === 'finals' || stage === 'complete') && state.finalsState) {
    const { team1Id, team2Id, games, winnerId } = state.finalsState;
    const t1 = getName(team1Id);
    const t2 = getName(team2Id);
    const w1 = games.filter((g) => g.winnerId === team1Id).length;
    const w2 = games.filter((g) => g.winnerId === team2Id).length;

    lines.push(`## 🥊 ${t('finals.heading')} — ${t('finals.subtitle')}`);
    lines.push('');
    lines.push(`  **${t1}** ${t('common.vs')} **${t2}** — ${w1}–${w2}`);
    if (winnerId) {
      lines.push('');
      lines.push(`🎉 **${t('finals.champion', { name: getName(winnerId) })}** 🎉`);
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}
