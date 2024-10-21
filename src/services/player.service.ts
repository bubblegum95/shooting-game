import { Repository } from 'typeorm';
import { Player } from './entities/player.entity';

export class PlayerService {
  constructor(private playerRepository: Repository<Player>) {}

  create(matchId: string, teamId: string, userId: string) {
    return this.playerRepository.create({ matchId, teamId, userId });
  }

  findOne(playerId: Player['id']) {
    return this.playerRepository.findOne({ where: { id: playerId } });
  }
}
