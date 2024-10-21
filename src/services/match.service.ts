import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { MatchStatus } from '../types/match-status.type';

export class MatchService {
  constructor(private matchRepository: Repository<Match>) {}

  async findOne(id: string) {
    return await this.matchRepository.findOne({ where: { id } });
  }

  create(ownerId: string, type: keyof typeof BattleField) {
    return this.matchRepository.create({ ownerId, type });
  }
}
