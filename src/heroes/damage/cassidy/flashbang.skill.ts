import { Namespace } from 'socket.io';
import { ModuleInitLog, logger } from '../../../winston';
import { RedisService } from '../../../services/redis.service';
import { Hero } from '../../hero';
import { updateMatchStatus } from '../../updateMatchStatus';
import { Skill } from '../../skill';
import { Player } from '../../../entities/player.entity';
import { Match } from '../../../entities/match.entity';
import { Team } from '../../../entities/team.entity';

export class Flashbang extends Skill {
  constructor(
    public whose: Player['id'],
    public teamId: Team['id'],
    public matchId: Match['id'],
    public name: string,
    public category: 'secondary',
    public type1: 'lethal',
    public type2: 'throwing',
    public isActive: boolean,
    public duration: number,
    public cooltime: number,
    public power: number,
    public point: number
  ) {
    super(name, whose, teamId, matchId, category, type1, type2, isActive);
    logger.info(ModuleInitLog, { filename: 'Flashbang' });
  }

  async use(io: Namespace, redisService: RedisService) {
    if (this.isActive) {
      this.isActive = false;
      await updateMatchStatus(io, redisService, this);

      setTimeout(async () => {
        this.isActive = true;
        await updateMatchStatus(io, redisService, this);
      }, this.cooltime);
    }
  }

  async to(
    io: Namespace,
    redisService: RedisService,
    target: Hero | Skill,
    callback: (io: Namespace, redisService: RedisService) => Promise<void>
  ) {
    target.takeDamage(io, redisService, this.power, callback);
    target.shocked(io, redisService, this.duration);
    await updateMatchStatus(io, redisService, this);
  }
}
// this.isShocked 상태일 때 캐릭터 스킬 비활성화 하는 로직
// basic Skill 을 제외한 모든 스킬을 비활성화.. this가 instanceof BasicSkill가 아니라면
// this를 순회하려면..?? this 중에서 skill만 어떻게 가져올 것인가? -> skills : Skill[] 을 추가해서 스킬을 순회하며 instanceof 로 필터링

Hero.prototype.exceptPrimary = function (
  io: Namespace,
  redisService: RedisService,
  duration: number
) {
  Object.values(this.skills).forEach(async (skill) => {
    if (skill.category !== 'primary') {
      skill.isNotUseable(io, redisService);
      await updateMatchStatus(io, redisService, skill);

      setTimeout(async () => {
        skill.isNotUseable(io, redisService);
        await updateMatchStatus(io, redisService, skill);
      }),
        duration;
    }
  });
};

Hero.prototype.isNotAbleToUseSkillsDuring = async function (duration: number) {
  if (this.isShocked === true) {
    this.exceptPrimary(duration);
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
    await updateMatchStatus(io, redisService, this);

    setTimeout(async () => {
      this.isShocked = false;
      delete this.isShocked;
      await updateMatchStatus(io, redisService, this);
    }, duration);
  }
};
