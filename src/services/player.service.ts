import { Repository } from 'typeorm';
import { Player } from '../entities/player.entity';

export class PlayerService {
  constructor(private playerRepository: Repository<Player>) {}

  async create(matchId: string, teamId: string, userId: string) {
    return this.playerRepository.save({ matchId, teamId, userId });
  }

  async findOne(playerId: Player['id']) {
    return this.playerRepository.findOne({ where: { id: playerId } });
  }

  async remove(playerId: Player['id']) {
    const existPlayer = await this.findOne(playerId);
    if (!existPlayer) {
      throw new Error('해당 플레이어가 존재하지 않습니다.');
    }

    await this.playerRepository.delete({ id: playerId });
  }
}
