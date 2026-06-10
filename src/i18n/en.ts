export const en = {
  // App
  'app.title': 'Tournament Manager',
  'app.reset': 'New Tournament',
  'app.back': 'Back',
  'app.resetConfirmTitle': 'Start a new tournament?',
  'app.resetConfirmBody':
    'This will permanently delete the current tournament and all results. Continue?',

  // Common
  'common.vs': 'vs',
  'common.winner': 'Winner',
  'common.edit': 'Edit',
  'common.clear': 'Clear',
  'common.minutes': 'min',
  'common.seconds': 'sec',
  'common.cancel': 'Cancel',
  'common.confirm': 'Confirm',
  'common.close': 'Close',
  'common.duration': 'Duration',
  'common.team': 'Team',
  'common.notPlayed': 'Not played',

  // Setup
  'setup.heading': 'Set Up Tournament',
  'setup.teamsLabel': 'Teams (one per line)',
  'setup.teamsHelper': 'Enter an even number of teams, minimum 4. One team name per line.',
  'setup.teamsPlaceholder': 'Team Alpha\nTeam Bravo\nTeam Charlie\nTeam Delta',
  'setup.roundsLabel': 'Number of rounds',
  'setup.roundsHelper': 'Between 1 and {max} (each pairing is unique across rounds).',
  'setup.teamCount': '{count} teams entered',
  'setup.start': 'Start Tournament',
  'setup.resume': 'Resume Round Robin',
  'setup.restartTitle': 'Restart tournament?',
  'setup.restartBody':
    'Changing teams or rounds will regenerate the schedule and clear all results. Continue?',
  'setup.errEven': 'The number of teams must be even.',
  'setup.errMin': 'At least 4 teams are required.',
  'setup.errDuplicate': 'Duplicate team name: "{name}".',
  'setup.errEmptyLine': 'Team names cannot be empty.',
  'setup.errRounds': 'Rounds must be between 1 and {max}.',

  // Round Robin
  'rr.heading': 'Round Robin',
  'rr.round': 'Round {number}',
  'rr.roundProgress': '{done}/{total} matches complete',
  'rr.advance': 'Advance',
  'rr.advanceHelper': 'Complete all matches to advance.',
  'rr.advanceToQF': 'Advance to Quarter Finals',
  'rr.advanceToSF': 'Advance to Semi Finals',
  'rr.advanceToFinals': 'Advance to Finals',

  // Standings
  'standings.heading': 'Standings',
  'standings.rank': '#',
  'standings.team': 'Team',
  'standings.wins': 'Wins',
  'standings.losses': 'Losses',
  'standings.duration': 'Win Time',
  'standings.tiebreak': 'Tiebreak',
  'standings.qualifies': 'Qualifies',
  'standings.tb.wins': 'Wins',
  'standings.tb.headToHead': 'H2H',
  'standings.tb.duration': 'Time',
  'standings.tb.random': 'Draw',
  'standings.tb.none': '—',
  'standings.tbTooltip.wins': 'Ranked by number of wins.',
  'standings.tbTooltip.headToHead': 'Tie broken by head-to-head record among tied teams.',
  'standings.tbTooltip.duration': 'Tie broken by lower total winning time.',
  'standings.tbTooltip.random': 'Tie broken by random draw.',

  // Bracket
  'bracket.quarterfinals': 'Quarter Finals',
  'bracket.semifinals': 'Semi Finals',
  'bracket.advance': 'Advance',
  'bracket.match': 'Match {number}',
  'bracket.advanceToSF': 'Advance to Semi Finals',
  'bracket.advanceToFinals': 'Advance to Finals',
  'bracket.champion': 'Champion',
  'bracket.tbd': 'TBD',

  // Finals
  'finals.heading': 'Finals',
  'finals.subtitle': 'Best of 3',
  'finals.game': 'Game {number}',
  'finals.series': 'Series',
  'finals.champion': '{name} is the Champion!',
  'finals.recordWinner': 'Who won game {number}?',

  // Dialogs
  'dialog.cascadeTitle': 'Reset later stages?',
  'dialog.cascadeBody':
    'Changing this result will reset {stage} and everything after it. All progress in those stages will be lost. Continue?',
  'dialog.stage.quarterfinals': 'the Quarter Finals',
  'dialog.stage.semifinals': 'the Semi Finals',
  'dialog.stage.finals': 'the Finals',
  'dialog.stage.knockouts': 'the knockout stages',

  // Export / Import
  'io.exportTitle': 'Export Tournament',
  'io.exportHelp': 'Copy this text to save your tournament. You can load it later via Import.',
  'io.copy': 'Copy to Clipboard',
  'io.copied': 'Copied!',
  'io.importTitle': 'Import Tournament',
  'io.importHelp': 'Paste a previously exported tournament state below.',
  'io.load': 'Load Tournament',
  'io.importError': 'Invalid tournament data. Please check the text and try again.',
  'io.export': 'Export',
  'io.import': 'Import',

  // Theme
  'theme.toLight': 'Switch to light mode',
  'theme.toDark': 'Switch to dark mode',

  // Language
  'lang.label': 'Language',
} as const;

export type TranslationKey = keyof typeof en;
