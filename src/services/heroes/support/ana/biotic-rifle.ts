import { Namespace } from 'socket.io';
import { Hero } from '../../hero';
import { RedisService } from '../../../redis.service';
import { Ana } from './ana';
import { ModuleInitLog, logger } from '../../../../winston';
import { LethalSkill } from '../../../skill/lethal.skill';
import { resetMatchStatus } from '../../renewMatchStatus';

export class BioticRifle extends LethalSkill {
  constructor(
    public name: string,
    public isActive: boolean,
    public cooltime: number,
    public power: number, // 치유량 또는 공격량
    public point: number, // 궁극기 게이지 포인트
    public isScoped: boolean,
    public bullets: number,
    public maxBullets: number,
    public chargingTime: number // 탄창 충전 시간
  ) {
    super(name, isActive, cooltime, power, point);
    logger.info(ModuleInitLog, { filename: 'BioticRifle' });
  }

  async chargeBullets(io: Namespace, redisService: RedisService, player: Ana) {
    super.chargeBullets(io, redisService, player);
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

  async shot(io: Namespace, redisService: RedisService, player: Ana) {
    if (this.bullets > 0 && this.isActive) {
      this.bullets -= 1;
      this.isActive = false;
      await resetMatchStatus(io, redisService, player);

      setTimeout(async () => {
        this.isActive = true;
        await resetMatchStatus(io, redisService, player);
      }, this.cooltime);
    } else if (this.bullets <= 0) {
      this.chargeBullets(io, redisService, player);
    }
  }

  async heal(
    io: Namespace,
    redisService: RedisService,
    player: Ana,
    target: Hero
  ) {
    target.takeHeal(io, redisService, this.power);
    player.ultimate += this.point;
    await resetMatchStatus(io, redisService, player);
  }

  async attack(
    io: Namespace,
    redisService: RedisService,
    player: Hero,
    target: Hero
  ) {
    target.takeDamage(io, redisService, this.power);
    await resetMatchStatus(io, redisService, player);
  }

  async heat(
    io: Namespace,
    redisService: RedisService,
    player: Ana,
    target: Hero
  ) {
    if (player.team === target.team) {
      this.heal(io, redisService, player, target);
    } else {
      this.attack(io, redisService, player, target);
    }
  }

  async useScope(io: Namespace, redisService: RedisService, player: Ana) {
    this.isScoped = true;
    player.speed -= 0.5;
    await resetMatchStatus(io, redisService, player);
  }

  async noUseScope(io: Namespace, redisService: RedisService, player: Ana) {
    this.isScoped = false;
    player.speed += 0.5;
    await resetMatchStatus(io, redisService, player);
  }
}
