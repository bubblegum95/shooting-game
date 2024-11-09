import { Namespace } from 'socket.io';
import { Match } from '../../../entities/match.entity';
import { Player } from '../../../entities/player.entity';
import { Team } from '../../../entities/team.entity';
import { Hero } from '../../hero';
import { RedisService } from '../../../services/redis.service';
import { logger, ModuleInitLog } from '../../../winston';
import { RocketHammer } from './rocket-hammer.skill';
import { FireStrike } from './fire-strike.skill';
import { BarrierField } from './barrier-field.skill';
import { Charge } from './charge.skill';
import { Earthshatter } from './earthshatter.skill';
import { Skill } from '../../skill';

export class Reinhardt extends Hero {
  constructor(
    public name: 'Reinhardt', // 히어로 이름
    public role: 'Tank', // 직군
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
    public skills: {
      rocketHammer: RocketHammer;
      fireStrike: FireStrike;
      barrierField: BarrierField;
      charge: Charge;
      earthshatter: Earthshatter;
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

    logger.info(ModuleInitLog, { filename: 'ReinHardt' });
  }

  async useRocketHammer(io: Namespace, redisService: RedisService) {
    await this.skills.rocketHammer.use(io, redisService);
  }

  async useRocketHammerTo(
    io: Namespace,
    redisService: RedisService,
    target: Hero | Skill
  ) {
    await this.skills.rocketHammer.to(
      io,
      redisService,
      this,
      target,
      this.takeKill
    );
  }

  async useFireStrike(io: Namespace, redisService: RedisService) {
    await this.skills.fireStrike.use(io, redisService, this);
  }

  async useFireStrikeTo(
    io: Namespace,
    redisService: RedisService,
    target: Hero | Skill
  ) {
    await this.skills.fireStrike.to(
      io,
      redisService,
      this,
      target,
      this.takeKill
    );
  }

  async useBarrierField(io: Namespace, redisService: RedisService) {
    await this.skills.barrierField.use(io, redisService, this);
  }

  async charge(io: Namespace, redisService: RedisService) {
    await this.skills.charge.use(io, redisService, this);
  }

  async seize(io: Namespace, redisService: RedisService, target: Hero) {
    await this.skills.charge.seize(io, redisService, target);
  }

  async crash(io: Namespace, redisService: RedisService, target: Hero) {
    await this.skills.charge.crash(
      io,
      redisService,

      target,
      this.takeKill
    );
  }

  async useEarthshatter(io: Namespace, redisService: RedisService) {
    await this.skills.earthshatter.use(io, redisService);
  }

  async useEarthshatterTo(
    io: Namespace,
    redisService: RedisService,
    target: Hero | Skill
  ) {
    this.skills.earthshatter.to(io, redisService, target, this.takeKill);
  }
}
