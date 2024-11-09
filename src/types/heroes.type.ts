import { Match } from '../entities/match.entity';
import { Player } from '../entities/player.entity';
import { Team } from '../entities/team.entity';
import { cassidy } from './heroes/damage/cassidy.type';
import { ana } from './heroes/support/ana.type';
import { reinhardt } from './heroes/tank/reinhardt';

export const Heroes = function (
  type: string,
  matchId: Match['id'],
  teamId: Team['id'],
  playerId: Player['id']
) {
  switch (type) {
    case 'Ana':
      return ana(matchId, teamId, playerId);

    case 'Cassidy':
      return cassidy(matchId, teamId, playerId);

    case 'Reinhardt':
      return reinhardt(matchId, teamId, playerId);

    default:
      throw new Error();
  }
};
