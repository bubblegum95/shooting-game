import { Namespace } from 'socket.io';
import { RedisService } from '../../../services/redis.service';
import { Hero } from '../../hero';
import { ModuleInitLog, logger } from '../../../winston';
import { Skill } from '../../skill';
import { Player } from '../../../entities/player.entity';
import { Match } from '../../../entities/match.entity';
import { updateMatchStatus } from '../../updateMatchStatus';
import { Team } from '../../../entities/team.entity';

export class Deadeye extends Skill {
  constructor(
    public whose: Player['id'],
    public teamId: Team['id'],
    public matchId: Match['id'],
    public name: string,
    public category: 'ultimate',
    public type1: 'lethal',
    public type2: 'mounting',
    public isActive: boolean,
    public casting: boolean,
    public duration: number,
    public power: number
  ) {
    super(name, teamId, whose, matchId, category, type1, type2, isActive);
    logger.info(ModuleInitLog, { filename: 'Deadeye' });
  }

  async isUseable(io: Namespace, redisService: RedisService) {
    super.isUseable(io, redisService);
  }

  async use(io: Namespace, redisService: RedisService) {
    this.isActive = false;
    this.casting = true;
    await updateMatchStatus(io, redisService, this);

    setTimeout(() => {
      this.casting = false;
    }, this.duration);
    await updateMatchStatus(io, redisService, this);
  }

  async to(
    io: Namespace,
    redisService: RedisService,
    targets: Hero[],
    callback: (io: Namespace, redisService: RedisService) => Promise<void>
  ) {
    if (this.casting && targets) {
      for (const target of targets) {
        target.takeDamage(io, redisService, this.power, callback);
        await updateMatchStatus(io, redisService, target);
        await updateMatchStatus(io, redisService, this);
      }
    }
  }
}
