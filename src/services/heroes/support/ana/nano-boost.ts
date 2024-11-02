import { Namespace } from 'socket.io';
import { Hero } from '../../hero';
import { Ana } from './ana';
import { RedisService } from '../../../redis.service';
import { ModuleInitLog, logger } from '../../../../winston';
import { Skill } from '../../skill';
import { resetMatchStatus } from '../../renewMatchStatus';

export class NanoBoost extends Skill {
  constructor(
    public name: string,
    public isActive: boolean, // 활성화
    public duration: number, // 스킬 지속시간
    public increase: number // 공격력 증가량
  ) {
    super(name, isActive);
    logger.info(ModuleInitLog, { filename: 'NanoBoost' });
  }

  async isUseable(io: Namespace, redisService: RedisService, player: Ana) {
    this.isActive = true;
    await resetMatchStatus(io, redisService, player);
  }

  async useTo(
    io: Namespace,
    redisService: RedisService,
    player: Ana,
    target: Hero
  ) {
    if (this.isActive && target) {
      this.isActive = false;
      await resetMatchStatus(io, redisService, player);
      target.DamageSkill.powerUp(
        io,
        redisService,
        target,
        this.increase,
        this.duration
      );
    }
  }
}
