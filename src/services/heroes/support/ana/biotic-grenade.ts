import { Namespace } from 'socket.io';
import { Hero } from '../../hero';
import { RedisService } from '../../../redis.service';
import { Ana } from './ana';
import { ModuleInitLog, logger } from '../../../../winston';
import { resetMatchStatus } from '../../renewMatchStatus';
import { LethalSkill } from '../../../skill/lethal.skill';

export class BioticGrenade extends LethalSkill {
  constructor(
    public name: string,
    public isActive: boolean,
    public power: number,
    public point: number,
    public duration: number, // 치유 증강/차단 지속시간
    public cooltime: number
  ) {
    super(name, isActive, cooltime, power, point);
    logger.info(ModuleInitLog, { filename: 'BioticGrenade' });
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

  async use(io: Namespace, redisService: RedisService, player: Ana) {
    // return 값은 io 에 보낼 결과값, socket으로 보낼 값은 쿨타임 남은 시간?
    if (this.isActive) {
      this.isActive = false;
      await resetMatchStatus(io, redisService, player);

      setTimeout(async () => {
        this.isActive = true;
        await resetMatchStatus(io, redisService, player);
      }, this.cooltime);
    }
  }

  async to(
    io: Namespace,
    redisService: RedisService,
    player: Ana,
    target: Hero
  ) {
    if (target.playerId && player.team === target.team) {
      target.takeHeal(io, redisService, this.power);
      player.ultimate += this.point;
      await resetMatchStatus(io, redisService, target);
    } else if (target.playerId && player.team !== target.team) {
      target.takeDamage(io, redisService, this.power);
      target.healBan(io, redisService, this.duration);
      player.ultimate += this.point;
      await resetMatchStatus(io, redisService, target);
    }
  }
}

Hero.prototype.healBan = async function (
  io: Namespace,
  redisService: RedisService,
  duration: number
) {
  if (this.isAlive) {
    this.isHealBan = true;
    await resetMatchStatus(io, redisService, this);

    setTimeout(async () => {
      this.isHealBan = false;
      await resetMatchStatus(io, redisService, this);
    }, duration);
  }
};
