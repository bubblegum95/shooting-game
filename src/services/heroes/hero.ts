import { Namespace } from 'socket.io';
import { HeroName } from '../../types/hero-name.type';
import { Role } from '../../types/role.type';
import { Match } from '../../entities/match.entity';
import { RedisService } from '../redis.service';
import { Player } from '../../entities/player.entity';
import { Team } from '../../entities/team.entity';
import { resetMatchStatus } from './renewMatchStatus';

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
    public dead: boolean, // 사망 상태
    public kill: number, //킬 수
    public death: number, // 사망 수
    public matchId: Match['id'],
    public teamId: Team['id'],
    public playerId: Player['id']
  ) {}

  // 사망 후 리스폰
  async dieNRespawn(io: Namespace, redisService: RedisService) {
    try {
      this.dead = true;
      await resetMatchStatus(io, redisService, this);

      setTimeout(async () => {
        this.health = this.maxHealth;
        this.dead = false;
        this.death += 1;
        await resetMatchStatus(io, redisService, this);
      }, 3 * 1000);
    } catch (error) {
      throw error;
    }
  }

  async takeDamage(io: Namespace, redisService: RedisService, power: number) {
    this.health -= power;
    await resetMatchStatus(io, redisService, this);

    if (this.health <= 0) {
      await this.dieNRespawn(io, redisService);
      await resetMatchStatus(io, redisService, this);
    }
  }

  async takeHeal(io: Namespace, redisService: RedisService, power: number) {
    this.health += power;
    await resetMatchStatus(io, redisService, this);

    if (this.health >= this.maxHealth) {
      this.health = this.maxHealth;
      await resetMatchStatus(io, redisService, this);
    }
  }
}
