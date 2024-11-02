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
import { BioticRifle } from './biotic-rifle';

export class Ana extends Support {
  constructor(
    public name: HeroName,
    public role: Role.Support,
    public health: number,
    public maxHealth: number,
    public speed: number,
    public ultimate: number,
    public maxUltimate: number,
    public dead: boolean,
    public kill: number,
    public death: number,
    public matchId: Match['id'],
    public teamId: Team['id'],
    public playerId: Player['id'],
    public bioticGrenade: BioticGrenade,
    public nanoBoost: NanoBoost,
    public sleepDart: SleepDart,
    public bioticRifle: BioticRifle
  ) {
    super(
      name,
      role,
      health,
      maxHealth,
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

  async takeDamage(io: Namespace, redisService: RedisService, amount: number) {
    return super.takeDamage(io, redisService, amount);
  }

  async takeHeal(io: Namespace, redisService: RedisService, amount: number) {
    return await super.takeHeal(io, redisService, amount);
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

  async chargeNanoBoost(io: Namespace, redisService: RedisService) {
    if (this.ultimate >= this.maxUltimate) {
      await this.nanoBoost.isUseable(io, redisService, this);
    }
  }

  async usesNanoBoost(io: Namespace, redisService: RedisService, target: Hero) {
    await this.nanoBoost.useTo(io, redisService, this, target);
  }

  async attackAndHeal(io: Namespace, redisService: RedisService, target: Hero) {
    await this.bioticRifle.attackAndHeal(io, redisService, this, target);
  }

  async useScope(io: Namespace, redisService: RedisService) {
    await this.bioticRifle.useScope(io, redisService, this);
  }

  async noUseScope(io: Namespace, redisService: RedisService) {
    await this.bioticRifle.noUseScope(io, redisService, this);
  }

  async chargeBullets(io: Namespace, redisService: RedisService) {
    await this.bioticRifle.chargeBullets(io, redisService, this);
  }
}
