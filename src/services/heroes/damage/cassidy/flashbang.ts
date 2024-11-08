import { Namespace } from 'socket.io';
import { ModuleInitLog, logger } from '../../../../winston';
import { RedisService } from '../../../redis.service';
import { Cassidy } from './cassidy';
import { Hero } from '../../hero';
import { resetMatchStatus } from '../../renewMatchStatus';
import { Skill } from '../../../skill/skill';

export class Flashbang extends Skill {
  constructor(
    public name: string,
    public category: 'secondary',
    public type: 'lethal',
    public isDeployable: false,
    public isActive: boolean,
    public duration: number,
    public cooltime: number,
    public power: number,
    public point: number
  ) {
    super(name, category, type, isDeployable, isActive);
    logger.info(ModuleInitLog, { filename: 'Flashbang' });
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
    player: Cassidy,
    target: Hero,
    callback: (io: Namespace, redisService: RedisService) => void
  ) {
    target.takeDamage(io, redisService, this.power, callback);
    target.shocked(io, redisService, this.duration);
    await resetMatchStatus(io, redisService, player);
  }
}
// this.isShocked 상태일 때 캐릭터 스킬 비활성화 하는 로직
// basic Skill 을 제외한 모든 스킬을 비활성화.. this가 instanceof BasicSkill가 아니라면
// this를 순회하려면..?? this 중에서 skill만 어떻게 가져올 것인가? -> skills : Skill[] 을 추가해서 스킬을 순회하며 instanceof 로 필터링

Hero.prototype.exceptPrimarySkill = function (duration: number) {
  Object.values(this.skills).forEach(async (skill) => {
    if (skill.category !== 'primary') {
      skill.isActive = false;

      setTimeout(() => {
        skill.isActive = true;
      }),
        duration;
    }
  });
};

Hero.prototype.isNotAbleToUseSkillsDuring = async function (duration: number) {
  if (this.isShocked === true) {
    this.exceptPrimarySkill(duration);
  }
};

Hero.prototype.shocked = async function (
  io: Namespace,
  redisService: RedisService,
  duration: number
) {
  if (this.isAlive) {
    this.isShocked = true;
    this.isNotAbleToUseSkillsDuring(duration);
    await resetMatchStatus(io, redisService, this);

    setTimeout(async () => {
      this.isShocked = false;
      delete this.isShocked;
      await resetMatchStatus(io, redisService, this);
    }, duration);
  }
};
