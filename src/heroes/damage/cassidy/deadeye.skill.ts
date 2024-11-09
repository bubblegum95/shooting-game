import { Namespace } from 'socket.io';
import { RedisService } from '../../../services/redis.service';
import { Hero } from '../../hero';
import { updateMatchStatus } from '../../updateMatchStatus';
import { Cassidy } from './cassidy.hero';
import { ModuleInitLog, logger } from '../../../winston';
import { Skill } from '../../skill';
import { Player } from '../../../entities/player.entity';
import { Match } from '../../../entities/match.entity';

export class Deadeye extends Skill {
  constructor(
    public name: string,
    public whose: Player['id'],
    public matchId: Match['id'],
    public category: 'ultimate',
    public type1: 'lethal',
    public type2: 'mounting',
    public isActive: boolean,
    public casting: boolean,
    public duration: number,
    public power: number
  ) {
    super(name, whose, matchId, category, type1, type2, isActive);
    logger.info(ModuleInitLog, { filename: 'Deadeye' });
  }

  async isUseable(io: Namespace, redisService: RedisService, player: Hero) {
    super.isUseable(io, redisService, player);
  }

  async use(io: Namespace, redisService: RedisService, player: Cassidy) {
    this.isActive = false;
    this.casting = true;
    await updateMatchStatus(io, redisService, player);

    setTimeout(() => {
      this.casting = false;
    }, this.duration);
    await updateMatchStatus(io, redisService, player);
  }

  async to(
    io: Namespace,
    redisService: RedisService,
    player: Hero,
    targets: Hero[],
    callback: (io: Namespace, redisService: RedisService) => void
  ) {
    if (this.casting && targets) {
      for (const target of targets) {
        target.takeDamage(io, redisService, this.power, callback);
        await updateMatchStatus(io, redisService, target);
        await updateMatchStatus(io, redisService, player);
      }
    }
  }
}
