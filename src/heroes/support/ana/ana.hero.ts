import { Namespace } from 'socket.io';
import { Hero } from '../../hero';
import { BioticGrenade } from './biotic-grenade.skill';
import { NanoBoost } from './nano-boost.skill';
import { SleepDart } from './sleep-dart.skill';
import { RedisService } from '../../../services/redis.service';
import { Match } from '../../../entities/match.entity';
import { Player } from '../../../entities/player.entity';
import { Team } from '../../../entities/team.entity';
import { BioticRifle } from './biotic-rifle.skill';
import { Scope } from './scope.skill';
import { Skill } from '../../skill';

export class Ana extends Hero {
  constructor(
    public name: 'Ana',
    public role: 'Support',
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
      scope: Scope;
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

  async shot(io: Namespace, redisService: RedisService) {
    if (this.isAlive) {
      await this.skills.bioticRifle.shot(io, redisService);
    }
  }

  // 아군은 힐 적군은 딜
  async heat(io: Namespace, redisService: RedisService, target: Hero | Skill) {
    await this.skills.bioticRifle.heat(
      io,
      redisService,
      this,
      target,
      this.takeKill
    );
  }

  async useScope(io: Namespace, redisService: RedisService) {
    if (this.isAlive && !this.isShocked) {
      await this.skills.scope.use(io, redisService, this);
    }
  }

  async noUseScope(io: Namespace, redisService: RedisService) {
    if (this.isAlive && !this.isShocked) {
      await this.skills.scope.noUse(io, redisService, this);
    }
  }

  async chargeBullets(io: Namespace, redisService: RedisService) {
    if (this.isAlive) {
      await this.skills.bioticRifle.chargeBullets(io, redisService);
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
    target: Hero | Skill
  ) {
    await this.skills.bioticGrenade.to(
      io,
      redisService,
      this,
      target,
      this.takeKill
    );
  }

  async usesSleepDart(io: Namespace, redisService: RedisService) {
    if (this.isAlive && !this.isShocked) {
      await this.skills.sleepDart.use(io, redisService, this);
    }
  }

  async usesSleepDartTo(
    io: Namespace,
    redisService: RedisService,
    target: Hero | Skill
  ) {
    await this.skills.sleepDart.to(
      io,
      redisService,
      this,
      target,
      this.takeKill
    );
  }

  async chargeNanoBoost(io: Namespace, redisService: RedisService) {
    if (this.ultimate >= this.maxUltimate) {
      await this.skills.nanoBoost.isUseable(io, redisService);
    }
  }

  async usesNanoBoost(io: Namespace, redisService: RedisService, target: Hero) {
    if (this.isAlive && target.teamId === this.teamId) {
      await this.skills.nanoBoost.useTo(io, redisService, target);
    }
  }
}
