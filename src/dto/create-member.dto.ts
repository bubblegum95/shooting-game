import { Match } from '../game/entities/match.entity';
import { Team } from '../game/entities/team.entity';
import { User } from '../entities/user.entity';

export class CreateMemberDto {
  constructor(
    public matchId: Match['id'],
    public teamId: Team['id'],
    public userId: User['id']
  ) {}
}
