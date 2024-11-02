import { Match } from '../entities/match.entity';
import { Team } from '../entities/team.entity';
import { User } from '../entities/user.entity';

export class CreateMemberDto {
  constructor(
    public matchId: Match['id'],
    public teamId: Team['id'],
    public userId: User['id']
  ) {}
}
