import { Namespace } from 'socket.io';
import { Hero } from '../../hero';
import { Ana } from './ana';
import { RedisService } from '../../../redis.service';
import { ModuleInitLog, logger } from '../../../../winston';
import { resetMatchStatus } from '../../renewMatchStatus';
import { Skill } from '../../../skill/skill';

export class NanoBoost extends Skill {
  constructor(
    public name: string,
    public category: 'ultimate',
    public type: 'non-lethal',
    public isDeployable: false,
    public isActive: boolean, // 활성화
    public duration: number, // 스킬 지속시간
    public increase: number // 공격력 증가량
  ) {
    super(name, category, type, isDeployable, isActive);
    logger.info(ModuleInitLog, { filename: 'NanoBoost' });
  }

  async isUseable(io: Namespace, redisService: RedisService, player: Ana) {
    super.isUseable(io, redisService, player);
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
      target.boostUp(io, redisService, this.duration);
    }
  }
}

Hero.prototype.boostUp = function (
  io: Namespace,
  redisService: RedisService,
  duration: number
) {
  this.isReinforced = true;
  for (const skill of Object.values(this.skills)) {
    if (skill.type === 'lethal' || skill.type === 'mixed') {
      skill.powerUp(io, redisService, this, this.increase, this.duration);
    }
  }

  setTimeout(() => {
    this.isReinforced = false;
    delete this.isReinforced;
  }, duration);
};

Skill.prototype.powerUp = async function (
  io: Namespace,
  redisService: RedisService,
  target: Hero,
  increase: number,
  duration: number
) {
  if (target.isReinforced) {
    this.power *= increase;
    await resetMatchStatus(io, redisService, target);

    setTimeout(async () => {
      this.power /= increase;
      await resetMatchStatus(io, redisService, target);
    }, duration);
  }
};
