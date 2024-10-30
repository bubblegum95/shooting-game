import { Namespace } from 'socket.io';
import { Hero } from '../../hero';
import { RedisService } from '../../../redis.service';
import { Ana } from './ana';
import { ModuleInitLog, logger } from '../../../../winston';
import { renewMatchStatus } from '../../renewMatchStatus';
import { LethalSkill } from '../../lethal-skill';

export class BioticGrenade extends LethalSkill {
  constructor(
    public name: string,
    public isActive: boolean,
    public power: number,
    public duration: number, // 치유 차단 지속시간
    public cooltime: number
  ) {
    super(name, isActive, duration, cooltime, power);
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

  async useTo(
    io: Namespace,
    redisService: RedisService,
    player: Ana,
    target: Hero
  ) {
    // return 값은 io 에 보낼 결과값, socket으로 보낼 값은 쿨타임 남은 시간?
    if (this.isActive && target.playerId) {
      this.isActive = false;
      await renewMatchStatus(io, redisService, player);

      setTimeout(async () => {
        this.isActive = true;
        await renewMatchStatus(io, redisService, player);
      }, this.cooltime);

      if (target.playerId && player.team === target.team) {
        target.takeHeal(io, redisService, this.power);
        await renewMatchStatus(io, redisService, target);
      } else if (target.playerId && player.team !== target.team) {
        target.takeDamage(io, redisService, this.power);
        target.healBan(io, redisService, this.duration);
        await renewMatchStatus(io, redisService, target);
      }
    }
  }
}

Hero.prototype.healBan = async function (
  io: Namespace,
  redisService: RedisService,
  duration: number
) {
  this.isHealBan = true;
  await renewMatchStatus(io, redisService, this);

  setTimeout(async () => {
    this.isHealBan = false;
    await renewMatchStatus(io, redisService, this);
  }, duration);
};
