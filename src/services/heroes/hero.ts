import { Namespace } from 'socket.io';
import { HeroName } from '../../types/hero-name.type';
import { Role } from '../../types/role.type';
import { Match } from '../../entities/match.entity';
import { RedisService } from '../redis.service';
import { Player } from '../../entities/player.entity';
import { Team } from '../../entities/team.entity';

export class Hero {
  [key: string]: any; // 인덱스 시그니처로 동적 속성 허용

  constructor(
    public name: HeroName,
    public role: Role,
    public health: number,
    public maxHealth: number,
    public power: number,
    public speed: number,
    public ultimate: number,
    public maxUltimate: number,
    public dead: boolean,
    public kill: number,
    public death: number,
    public matchId: Match['id'],
    public teamId: Team['id'],
    public playerId: Player['id']
  ) {}

  // 일반 공격
  async attacks(io: Namespace, redisService: RedisService, target: Hero) {
    console.log(
      `${this.name} attacks ${target.name} with ${this.power} power!`
    );
    await target.takesDamage(io, redisService, this.power);
  }

  // 데미지
  async takesDamage(io: Namespace, redisService: RedisService, amount: number) {
    this.health -= amount;
    if (this.playerId) {
      await redisService.setAllPlayerStatuses(this.playerId, this);
      const result = await redisService.getMatchStatus(this.matchId);
      io.to(this.matchId).emit('match:status', result);
      console.log(
        `${this.name} took ${amount} damage. Health is now ${this.health}.`
      );
    }
  }

  // 힐
  async takesHeal(io: Namespace, redisService: RedisService, amount: number) {
    if (this.playerId) {
      this.health += amount;
      await redisService.setAllPlayerStatuses(this.playerId, this);
      const result = await redisService.getMatchStatus(this.matchId);
      io.to(this.matchId).emit('match:status', result);
      console.log(
        `${this.name} took ${amount} heal. Health is now ${this.health}.`
      );
    }
  }

  // 궁극기 스킬 사용
  async usesUltimate(io: Namespace, redisService: RedisService) {
    if (this.playerId) {
      this.ultimate = 0;
      await redisService.setAllPlayerStatuses(this.playerId, this);
      const result = await redisService.getMatchStatus(this.matchId);
      io.to(this.matchId).emit('match:status', result);
      console.log(`${this.name} use now ultimate skill`);
    }
  }

  // 사망 후 리스폰
  async diesNRespawns(
    io: Namespace,
    redisService: RedisService,
    duration: number
  ) {
    try {
      if (this.playerId && this.health <= 0) {
        this.dead = true;
        await redisService.setAllPlayerStatuses(this.playerId, this);
        const result = await redisService.getMatchStatus(this.matchId);
        io.to(this.matchId).emit('match:status', result);

        setTimeout(async () => {
          (this.health = this.maxHealth),
            (this.dead = false),
            (this.death += 1);
        }, duration);

        await redisService.setAllPlayerStatuses(this.playerId, this);
        const respawnResult = await redisService.getMatchStatus(this.matchId);
        io.to(this.matchId).emit('match:status', respawnResult);
      }
    } catch (error) {
      throw error;
    }
  }
}
