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
    public isAlive: boolean,
    public kill: number,
    public death: number,
    public matchId: Match['id'],
    public teamId: Team['id'],
    public playerId: Player['id'],
    public skills: {
      bioticRifle: BioticRifle;
      bioticGrenade: BioticGrenade;
      sleepDart: SleepDart;
      nanoBoost: NanoBoost;
    }
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
      playerId,
      skills
    );
  }

  async takeDamage(io: Namespace, redisService: RedisService, amount: number) {
    await super.takeDamage(io, redisService, amount);
  }

  async takeHeal(io: Namespace, redisService: RedisService, amount: number) {
    await super.takeHeal(io, redisService, amount);
  }

  async die(io: Namespace, redisService: RedisService) {
    await super.die(io, redisService);
  }

  async shot(io: Namespace, redisService: RedisService) {
    if (this.isAlive) {
      await this.skills.bioticRifle.shot(io, redisService, this);
    }
  }

  async heat(io: Namespace, redisService: RedisService, target: Hero) {
    await this.skills.bioticRifle.heat(io, redisService, this, target);
  }

  async useScope(io: Namespace, redisService: RedisService) {
    if (this.isAlive && !this.isShocked) {
      await this.skills.bioticRifle.useScope(io, redisService, this);
    }
  }

  async noUseScope(io: Namespace, redisService: RedisService) {
    if (this.isAlive && !this.isShocked) {
      await this.skills.bioticRifle.noUseScope(io, redisService, this);
    }
  }

  async chargeBullets(io: Namespace, redisService: RedisService) {
    if (this.isAlive) {
      await this.skills.bioticRifle.chargeBullets(io, redisService, this);
    }
  }

  async usesBioticGrenade(io: Namespace, redisService: RedisService) {
    if (this.isAlive && !this.isShocked) {
      await this.skills.bioticGrenade.use(io, redisService, this);
    }
  }

  async usesBioticGrenadeTo(
    io: Namespace,
    redisService: RedisService,
    target: Hero
  ) {
    await this.skills.bioticGrenade.to(io, redisService, this, target);
  }

  async usesSleepDart(io: Namespace, redisService: RedisService) {
    if (this.isAlive && !this.isShocked) {
      await this.skills.sleepDart.use(io, redisService, this);
    }
  }

  async usesSleepDartTo(
    io: Namespace,
    redisService: RedisService,
    target: Hero
  ) {
    await this.skills.sleepDart.to(io, redisService, this, target);
  }

  async chargeNanoBoost(io: Namespace, redisService: RedisService) {
    if (this.ultimate >= this.maxUltimate) {
      await this.skills.nanoBoost.isUseable(io, redisService, this);
    }
  }

  async usesNanoBoost(io: Namespace, redisService: RedisService, target: Hero) {
    if (this.isAlive && !this.isShocked) {
      await this.skills.nanoBoost.useTo(io, redisService, this, target);
    }
  }
}
