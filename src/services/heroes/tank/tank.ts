import { Namespace } from 'socket.io';
import { HeroName } from '../../../types/hero-name.type';
import { Role } from '../../../types/role.type';
import { RedisService } from '../../redis.service';
import { Hero } from '../hero';
import { Match } from '../../../entities/match.entity';
import { Team } from '../../../entities/team.entity';
import { Player } from '../../../entities/player.entity';

export class Tank extends Hero {
  constructor(
    public name: HeroName,
    public role: Role,
    public health: number,
    public maxHealth: number,
    public speed: number,
    public ultimate: number,
    public maxUltimate: number,
    public isAlive: boolean,
    public kill: number,
    public death: number,
    public matchId: Match['id'],
    public teamId: Team['id'],
    public playerId: Player['id'],
    public shield: number,
    public rush: number
  ) {
    super(
      name,
      role,
      health,
      maxHealth,
      speed,
      ultimate,
      maxUltimate,
      isAlive,
      kill,
      death,
      matchId,
      teamId,
      playerId
    );
    this.shield = shield;
    this.rush = rush;
  }

  async takeDamage(io: Namespace, redisService: RedisService, amount: number) {
    super.takeDamage(io, redisService, amount);
  }

  async takeHeal(io: Namespace, redisService: RedisService, power: number) {
    super.takeHeal(io, redisService, power);
  }

  async defend(amount: number) {
    this.shield -= amount;
    console.log(
      `${this.name} defends attack ${amount}. durability: ${this.shield}`
    );
  }

  async rushing(io: Namespace, redisService: RedisService, target: Hero) {
    target.takeDamage(io, redisService, this.rush);
  }
}
