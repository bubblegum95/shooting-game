import { Repository } from 'typeorm';
import { Match } from '../entities/match.entity';
import { MatchStatus } from '../types/match-status.type';

export class MatchService {
  constructor(private matchRepository: Repository<Match>) {}

  async findOne(id: string) {
    return await this.matchRepository.findOne({ where: { id } });
  }

  async create(
    ownerId: string,
    type: keyof typeof BattleField,
    password?: string
  ) {
    try {
      const match = await this.matchRepository.save({
        ownerId,
        type,
        password,
      });
      if (!match) {
        throw new Error('경기를 생성할 수 없습니다. matchService');
      }
      return match;
    } catch (error) {
      throw error;
    }
  }

  async find(page: number, limit: number) {
    return await this.matchRepository.find({
      where: [
        { status: MatchStatus.Ready },
        { status: MatchStatus.InProgress },
      ],
      select: { id: true, ownerId: true, status: true, createdAt: true },
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
