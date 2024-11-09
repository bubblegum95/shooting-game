import { Namespace } from 'socket.io';
import { Match } from '../entities/match.entity';
import { RedisService } from '../services/redis.service';
import { Player } from '../entities/player.entity';
import { Team } from '../entities/team.entity';
import { updatePlayerStatus } from './updateMatchStatus';
import { Skill } from './skill';

export class Hero {
  [key: string]: any; // 인덱스 시그니처로 동적 속성 허용

  constructor(
    public name: string, // 히어로 이름
    public role: 'Damage' | 'Tank' | 'Support', // 직군
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
        await updatePlayerStatus(io, redisService, this);

        setTimeout(async () => {
          this.health = this.maxHealth;
          this.isAlive = true;
          this.death += 1;
          await updatePlayerStatus(io, redisService, this);
        }, 5 * 1000);
      }
    } catch (error) {
      throw error;
    }
  }

  async takeKill(io: Namespace, redisService: RedisService) {
    this.kill += 1;
    await updatePlayerStatus(io, redisService, this);
  }

  async takeDamage(
    io: Namespace,
    redisService: RedisService,
    power: number,
    callback: (io: Namespace, redisService: RedisService) => void
  ) {
    if (this.isAlive) {
      this.health -= power;
      await updatePlayerStatus(io, redisService, this);

      if (this.health <= 0) {
        this.health = 0;
        await this.die(io, redisService);
        await updatePlayerStatus(io, redisService, this);
        callback(io, redisService);
      }
    }
  }

  async takeHeal(io: Namespace, redisService: RedisService, power: number) {
    if (this.isAlive && !this.isHealBan) {
      this.health += power;
      await updatePlayerStatus(io, redisService, this);

      if (this.health >= this.maxHealth) {
        this.health = this.maxHealth;
        await updatePlayerStatus(io, redisService, this);
      }
    }
  }

  async isPushed(io: Namespace, redisService: RedisService, distance: number) {
    if (this.isAlive) {
      if (this.role === 'Tank') {
        this.knockback = distance / 2;
        await updatePlayerStatus(io, redisService, this);
      } else {
        this.knockback = distance;
        await updatePlayerStatus(io, redisService, this);
      }

      delete this.knockback;
      await updatePlayerStatus(io, redisService, this);
    }
  }

  async isNotAbleToUseSkills(
    io: Namespace,
    redisService: RedisService,
    duration: number
  ) {
    for (const skill of Object.values(this.skills)) {
      if (skill.isActive) {
        skill.isNotUseable(io, redisService);
        await updatePlayerStatus(io, redisService, this);

        setTimeout(async () => {
          skill.isUseable(io, redisService);
          await updatePlayerStatus(io, redisService, this);
        }, duration);
      }
    }
  }

  async fellDown(io: Namespace, redisService: RedisService, duration: number) {
    if (this.isAlive) {
      this.knockDown = true;
      this.isNotAbleToUseSkills(io, redisService, duration);

      setTimeout(() => {
        this.knockDown = false;
        delete this.knockDown;
      }, duration);
    }
  }
}
