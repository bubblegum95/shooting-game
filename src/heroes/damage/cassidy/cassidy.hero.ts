import { Namespace } from 'socket.io';
import { Match } from '../../../entities/match.entity';
import { Player } from '../../../entities/player.entity';
import { Team } from '../../../entities/team.entity';
import { ModuleInitLog, logger } from '../../../winston';
import { RedisService } from '../../../services/redis.service';
import { Hero } from '../../hero';
import { Deadeye } from './deadeye.skill';
import { Flashbang } from './flashbang.skill';
import { Peacekeeper } from './peacekeeper.skill';
import { Rampage } from './rampage.skill';
import { Skill } from '../../skill';

export class Cassidy extends Hero {
  constructor(
    public name: 'Cassidy',
    public role: 'Damage',
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
      peacekeeper: Peacekeeper;
      rampage: Rampage;
      flashbang: Flashbang;
      deadeye: Deadeye;
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

    logger.info(ModuleInitLog, { filename: 'Cassidy' });
  }

  async chargeBullets(io: Namespace, redisService: RedisService) {
    await this.skills.peacekeeper.chargeBullets(io, redisService, this);
  }

  async shot(io: Namespace, redisService: RedisService) {
    await this.skills.peacekeeper.shot(io, redisService, this);
  }

  async heat(io: Namespace, redisService: RedisService, target: Hero | Skill) {
    await this.skills.peacekeeper.heat(
      io,
      redisService,
      this,
      target,
      this.takeKill
    );
  }

  async useRampage(io: Namespace, redisService: RedisService) {
    if (this.isAlive && !this.isShocked) {
      await this.skills.rampage.use(io, redisService, this);
    }
  }

  async useRampageTo(io: Namespace, redisService: RedisService, target: Hero) {
    if (this.isAlive && !this.isShocked) {
      await this.skills.rampage.to(
        io,
        redisService,
        this,
        target,
        this.takeKill
      );
    }
  }

  async useFlashbang(io: Namespace, redisService: RedisService) {
    await this.skills.flashbang.use(io, redisService, this);
  }

  async useFlashbangTo(
    io: Namespace,
    redisService: RedisService,
    target: Hero
  ) {
    await this.skills.flashbang.to(
      io,
      redisService,
      this,
      target,
      this.takeKill
    );
  }

  async useDeadeye(io: Namespace, redisService: RedisService) {
    await this.skills.deadeye.use(io, redisService, this);
  }

  async useDeadeyeTo(
    io: Namespace,
    redisService: RedisService,
    targets: Hero[]
  ) {
    await this.skills.deadeye.to(
      io,
      redisService,
      this,
      targets,
      this.takeKill
    );
  }
}
