import { Namespace } from 'socket.io';
import { RedisService } from '../../../redis.service';
import { Hero } from '../../hero';
import { resetMatchStatus } from '../../renewMatchStatus';
import { Cassidy } from './cassidy';
import { ModuleInitLog, logger } from '../../../../winston';
import { Skill } from '../../../skill/skill';

export class Deadeye extends Skill {
  constructor(
    public name: string,
    public category: 'ultimate',
    public type: 'lethal',
    public isDeployable: false,
    public isActive: boolean,
    public casting: boolean,
    public duration: number,
    public power: number,
    public point: number
  ) {
    super(name, category, type, isDeployable, isActive);
    logger.info(ModuleInitLog, { filename: 'Deadeye' });
  }

  async isUseable(io: Namespace, redisService: RedisService, player: Hero) {
    super.isUseable(io, redisService, player);
  }

  async use(io: Namespace, redisService: RedisService, player: Cassidy) {
    this.isActive = false;
    this.casting = true;
    await resetMatchStatus(io, redisService, player);

    setTimeout(() => {
      this.casting = false;
    }, this.duration);
    await resetMatchStatus(io, redisService, player);
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
        await resetMatchStatus(io, redisService, target);
        player.ultimate += this.point;
        await resetMatchStatus(io, redisService, player);
      }
    }
  }
}
