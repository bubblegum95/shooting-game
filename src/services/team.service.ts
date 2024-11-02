import { Repository } from 'typeorm';
import { Team } from '../entities/team.entity';

export class TeamService {
  constructor(private teamRepository: Repository<Team>) {}

  create(matchId: string) {
    return this.teamRepository.save({ matchId });
  }

  find(matchId: string) {
    return this.teamRepository.find({
      where: { matchId },
      relations: { players: true },
    });
  }
}
