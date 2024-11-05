import { Namespace } from 'socket.io';
import { HeroName } from '../../types/hero-name.type';
import { Role } from '../../types/role.type';
import { Match } from '../../entities/match.entity';
import { RedisService } from '../redis.service';
import { Player } from '../../entities/player.entity';
import { Team } from '../../entities/team.entity';
import { resetMatchStatus } from './renewMatchStatus';
import { Skill } from '../skill/skill';
import { BasicSkill } from '../skill/basic.skill';

export class Hero {
  [key: string]: any; // 인덱스 시그니처로 동적 속성 허용

  constructor(
    public name: HeroName, // 히어로 이름
    public role: Role, // 직군
    public health: number, // 현재 체력
    public maxHealth: number, // 최대 체력
    public speed: number, // 이동 속도
    public ultimate: number, // 궁극기 충전
    public maxUltimate: number, // 궁극기 최대 충전
    public isAlive: boolean, // 사망 상태
    public kill: number, //킬 수
    public death: number, // 사망 수
    public matchId: Match['id'],
    public teamId: Team['id'],
    public playerId: Player['id'],
    public skills: { [name: string]: Skill }
  ) {}

  // 사망 후 리스폰
  async die(io: Namespace, redisService: RedisService) {
    try {
      if (this.isAlive) {
        this.isAlive = false;
        await resetMatchStatus(io, redisService, this);

        setTimeout(async () => {
          this.health = this.maxHealth;
          this.isAlive = true;
          this.death += 1;
          await resetMatchStatus(io, redisService, this);
        }, 5 * 1000);
      }
    } catch (error) {
      throw error;
    }
  }

  async takeDamage(io: Namespace, redisService: RedisService, power: number) {
    if (this.isAlive) {
      this.health -= power;
      await resetMatchStatus(io, redisService, this);

      if (this.health <= 0) {
        await this.dieNRespawn(io, redisService);
        await resetMatchStatus(io, redisService, this);
      }
    }
  }

  async takeHeal(io: Namespace, redisService: RedisService, power: number) {
    if (this.isAlive && !this.isHealBan) {
      this.health += power;
      await resetMatchStatus(io, redisService, this);

      if (this.health >= this.maxHealth) {
        this.health = this.maxHealth;
        await resetMatchStatus(io, redisService, this);
      }
    }
  }

  // this.isShocked 상태일 때 캐릭터 스킬 비활성화 하는 로직
  // basic Skill 을 제외한 모든 스킬을 비활성화.. this가 instanceof BasicSkill가 아니라면
  // this를 순회하려면..?? this 중에서 skill만 어떻게 가져올 것인가? -> skills : Skill[] 을 추가해서 스킬을 순회하며 instanceof 로 필터링
  exceptBasicSkill(duration: number) {
    Object.values(this.skills).forEach((skill) => {
      if (!(skill instanceof BasicSkill)) {
        skill.isActive = false;
      }
    });

    setTimeout(() => {
      Object.values(this.skills).forEach((skill) => {
        if (!(skill instanceof BasicSkill)) {
          skill.isActive = true;
        }
      });
    }, duration);
  }

  async isNotAbleToUseSkillsDuring(duration: number) {
    if (this.isShocked === true) {
      this.exceptBasicSkill(duration);
    }
  }
}
