import { Namespace } from 'socket.io';
import { HeroName } from '../../../types/hero-name.type';
import { Role } from '../../../types/role.type';
import { Hero } from '../hero';
import { RedisService } from '../../redis.service';
import { Match } from '../../../entities/match.entity';
import { Player } from '../../../entities/player.entity';
import { Team } from '../../../entities/team.entity';

export class Support extends Hero {
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
    public heal: number,
    public matchId: Match['id'],
    public teamId: Team['id'],
    public playerId: Player['id']
  ) {
    super(
      name,
      role,
      health,
      maxHealth,
      power,
      speed,
      ultimate,
      maxUltimate,
      dead,
      kill,
      death,
      matchId,
      teamId,
      playerId
    );
  }

  async attacks(io: Namespace, redisService: RedisService, target: Hero) {
    return await super.attacks(io, redisService, target);
  }

  async healsAlly(
    io: Namespace,
    redisService: RedisService,
    target: Hero,
    point: number
  ) {
    target.takesHeal(io, redisService, this.heal);
    if (this.ultimate < 100 && target.playerId) {
      this.ultimate += point;
      await redisService.setAllPlayerStatuses(target.playerId, this);
      const result = await redisService.getMatchStatus(target.matchId);
      io.to(target.matchId).emit('match:status', result);
    }
  }

  async takesDamage(io: Namespace, redisService: RedisService, amount: number) {
    return super.takesDamage(io, redisService, amount);
  }

  async takesHeal(io: Namespace, redisService: RedisService, amount: number) {
    return await super.takesHeal(io, redisService, amount);
  }

  async usesUltimate(io: Namespace, redisService: RedisService) {
    return super.usesUltimate(io, redisService);
  }
}
