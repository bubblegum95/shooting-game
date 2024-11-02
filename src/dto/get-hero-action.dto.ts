import { Match } from '../entities/match.entity';
import { Player } from '../entities/player.entity';
import { Team } from '../entities/team.entity';

export class GetHeroActionDto {
  constructor(
    public matchId: Match['id'],
    public player: { id: Player['id']; teamId: Team['id']; skill: string },
    public target: { id: Player['id']; teamId: Team['id'] }
  ) {}
}
