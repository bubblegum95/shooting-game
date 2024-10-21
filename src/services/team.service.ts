import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';

export class TeamService {
  constructor(private teamRepository: Repository<Team>) {}

  create(matchId: string) {
    return this.teamRepository.create({ matchId });
  }

  find(matchId: string) {
    return this.teamRepository.find({ where: { matchId } });
  }
}
