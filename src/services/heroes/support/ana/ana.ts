import { Namespace } from 'socket.io';
import { HeroName } from '../../../../types/hero-name.type';
import { Role } from '../../../../types/role.type';
import { Hero } from '../../hero';
import { Support } from '../support';
import { BioticGrenade } from './biotic-grenade';
import { NanoBoost } from './nano-boost';
import { SleepDart } from './sleep-dart';
import { RedisService } from '../../../redis.service';
import { Match } from '../../../../entities/match.entity';
import { Player } from '../../../../entities/player.entity';
import { Team } from '../../../../entities/team.entity';

export class Ana extends Support {
  constructor(
    public name: HeroName,
    public role: Role.Support,
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
    public playerId: Player['id'],
    public bioticGrenade: BioticGrenade,
    public nanoBoost: NanoBoost,
    public sleepDart: SleepDart
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
      heal,
      matchId,
      teamId,
      playerId
    );
  }

  async attacksEnamy(io: Namespace, redisService: RedisService, target: Hero) {
    await super.attacks(io, redisService, target);
  }

  async healsAlly(
    io: Namespace,
    redisService: RedisService,
    target: Hero,
    point: number
  ) {
    await super.healsAlly(io, redisService, target, point);
  }

  async takesDamage(io: Namespace, redisService: RedisService, amount: number) {
    await super.takesDamage(io, redisService, amount);
  }

  async takesHeal(io: Namespace, redisService: RedisService, amount: number) {
    await super.takesHeal(io, redisService, amount);
  }

  async usesBioticGrenade(
    io: Namespace,
    redisService: RedisService,
    target: Hero
  ) {
    if (this.bioticGrenade['isActive']) {
      return await this.bioticGrenade.useTo(io, redisService, this, target);
    }
  }

  async usesSleepDart(io: Namespace, redisService: RedisService, target: Hero) {
    await this.sleepDart.useTo(io, redisService, this, target);
  }

  async usesNanoBoost(io: Namespace, redisService: RedisService, target: Hero) {
    return await this.nanoBoost.useTo(io, redisService, this, target);
  }
}
