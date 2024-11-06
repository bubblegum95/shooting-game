import { Namespace } from 'socket.io';
import { RedisService } from '../../../redis.service';
import { Cassidy } from './cassidy';
import { Hero } from '../../hero';
import { resetMatchStatus } from '../../renewMatchStatus';
import { ModuleInitLog, logger } from '../../../../winston';
import { Skill } from '../../../skill/skill';

export class Rampage extends Skill {
  constructor(
    public name: string,
    public category: 'secondary',
    public type: 'lethal',
    public isDeployable: false,
    public isActive: boolean,
    public cooltime: number,
    public term: number,
    public power: number,
    public point: number
  ) {
    super(name, category, type, isDeployable, isActive);
    logger.info(ModuleInitLog, { filename: 'Rampage' });
  }

  async powerUp(
    io: Namespace,
    redisService: RedisService,
    player: Hero,
    increase: number,
    duration: number
  ) {
    super.powerUp(io, redisService, player, increase, duration);
  }

  async use(io: Namespace, redisService: RedisService, player: Cassidy) {
    const bullets = player.skills.peacekeeper.bullets;

    if (this.isActive && bullets > 1) {
      this.isActive = false;

      for (let i = 0; i < bullets; i++) {
        player.skills.peacekeeper.bullets -= 1;
        await resetMatchStatus(io, redisService, player);

        setTimeout(() => {}, this.term);
      }

      setTimeout(async () => {
        this.isActive = true;
        await resetMatchStatus(io, redisService, player);
      }, this.cooltime);
    }
  }

  async to(
    io: Namespace,
    redisService: RedisService,
    player: Cassidy,
    target: Hero,
    callback: (io: Namespace, redisService: RedisService) => void
  ) {
    target.takeDamage(io, redisService, this.power, callback);
    player.ultimate += this.point;
    resetMatchStatus(io, redisService, player);
  }
}
