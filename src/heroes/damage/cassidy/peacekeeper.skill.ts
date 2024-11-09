import { Namespace } from 'socket.io';
import { Cassidy } from './cassidy.hero';
import { Hero } from '../../hero';
import { RedisService } from '../../../services/redis.service';
import { updateMatchStatus } from '../../updateMatchStatus';
import { ModuleInitLog, logger } from '../../../winston';
import { Skill } from '../../skill';
import { Player } from '../../../entities/player.entity';
import { Match } from '../../../entities/match.entity';

export class Peacekeeper extends Skill {
  constructor(
    public name: string,
    public whose: Player['id'],
    public matchId: Match['id'],
    public category: 'primary',
    public type1: 'lethal',
    public type2: 'mounting',
    public isActive: boolean,
    public cooltime: number,
    public bullets: number,
    public maxBullets: number,
    public power: number,
    public point: number,
    public chargingTime: number
  ) {
    super(name, whose, matchId, category, type1, type2, isActive);
    logger.info(ModuleInitLog, { filename: 'Peacekeeper' });
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

  async chargeBullets(
    io: Namespace,
    redisService: RedisService,
    player: Cassidy
  ) {
    super.chargeBullets(io, redisService, player);
  }

  async shot(io: Namespace, redisService: RedisService, player: Cassidy) {
    if (this.isActive && this.bullets > 0) {
      this.bullets -= 1;
      this.isActive = false;
      await updateMatchStatus(io, redisService, player);

      if (this.bullets <= 0) {
        this.chargeBullets(io, redisService, player);
      }

      setTimeout(async () => {
        this.isActive = true;
        await updateMatchStatus(io, redisService, player);
      }, this.cooltime);
    } else if (this.bullets <= 0) {
      this.chargeBullets(io, redisService, player);
    }
  }

  async heat(
    io: Namespace,
    redisService: RedisService,
    player: Cassidy,
    target: Hero | Skill,
    callback: (io: Namespace, redisService: RedisService) => void
  ) {
    if (target instanceof Hero) {
      target.takeDamage(io, redisService, this.power, callback);
      await updateMatchStatus(io, redisService, target);
      player.ultimate += this.point;
      await updateMatchStatus(io, redisService, player);
    } else if (target instanceof Skill) {
      target.takeDamage(io, redisService, this.power);
    }
  }
}
