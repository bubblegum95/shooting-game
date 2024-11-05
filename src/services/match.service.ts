import { Repository } from 'typeorm';
import { Match } from '../entities/match.entity';
import { MatchStatus } from '../types/match-status.type';
import { BattleFieldEnum } from '../types/battle-field.enum';
import { ModuleInitLog, logger } from '../winston';

export class MatchService {
  constructor(private matchRepository: Repository<Match>) {
    logger.info(ModuleInitLog, { filename: 'MatchService' });
  }

  async findOne(id: string) {
    return await this.matchRepository.findOne({ where: { id } });
  }

  async find(page: number, limit: number) {
    return await this.matchRepository.find({
      where: [
        { status: MatchStatus.Ready },
        { status: MatchStatus.InProgress },
      ],
      select: { id: true, ownerId: true, status: true, createdAt: true },
      relations: ['players'],
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async changeStart(matchId: Match['id']) {
    const existMatch = await this.findOne(matchId);
    return await this.matchRepository.update(
      { id: matchId },
      { status: MatchStatus.InProgress }
    );
  }

  async changeOver(matchId: Match['id']) {
    const existMatch = await this.findOne(matchId);
    return await this.matchRepository.update(
      { id: matchId },
      { status: MatchStatus.Over }
    );
  }
}
