import { Namespace } from 'socket.io';
import { Hero } from '../../hero';
import { Ana } from './ana.hero';
import { updateMatchStatus } from '../../updateMatchStatus';
import { Skill } from '../../skill';
import { logger, ModuleInitLog } from '../../../winston';
import { RedisService } from '../../../services/redis.service';
import { Player } from '../../../entities/player.entity';
import { Match } from '../../../entities/match.entity';

export class BioticRifle extends Skill {
  constructor(
    public name: string,
    public whose: Player['id'],
    public matchId: Match['id'],
    public category: 'primary',
    public type1: 'mixed',
    public type2: 'mounting',
    public isActive: boolean,
    public cooltime: number,
    public power: number, // 치유량 또는 공격량
    public point: number, // 궁극기 게이지 포인트
    public bullets: number,
    public maxBullets: number,
    public charging: number // 탄창 충전 시간
  ) {
    super(name, whose, matchId, category, type1, type2, isActive);
    logger.info(ModuleInitLog, { filename: 'BioticRifle' });
  }

  async chargeBullets(io: Namespace, redisService: RedisService, player: Ana) {
    this.bullets = this.maxBullets;
    await updateMatchStatus(io, redisService, player);
  }

  async shot(io: Namespace, redisService: RedisService, player: Ana) {
    if (this.bullets > 0 && this.isActive) {
      this.bullets -= 1;
      this.isActive = false;
      await updateMatchStatus(io, redisService, player);

      setTimeout(async () => {
        this.isActive = true;
        await updateMatchStatus(io, redisService, player);
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
    await updateMatchStatus(io, redisService, player);
  }

  async attack(
    io: Namespace,
    redisService: RedisService,
    player: Hero,
    target: Hero,
    callback: (io: Namespace, redisService: RedisService) => void
  ) {
    target.takeDamage(io, redisService, this.power, callback);
    await updateMatchStatus(io, redisService, player);
  }

  async heat(
    io: Namespace,
    redisService: RedisService,
    player: Ana,
    target: Hero,
    callback: (io: Namespace, redisService: RedisService) => void
  ) {
    if (player.team === target.team) {
      this.heal(io, redisService, player, target);
    } else {
      this.attack(io, redisService, player, target, callback);
    }
  }
}
