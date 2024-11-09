import { Namespace } from 'socket.io';
import { Skill } from '../../skill';
import { RedisService } from '../../../services/redis.service';
import { Reinhardt } from './reinhardt.hero';
import { Hero } from '../../hero';
import { updateMatchStatus } from '../../updateMatchStatus';
import { logger, ModuleInitLog } from '../../../winston';
import { Player } from '../../../entities/player.entity';
import { Match } from '../../../entities/match.entity';
import { Team } from '../../../entities/team.entity';

export class Earthshatter extends Skill {
  constructor(
    public whose: Player['id'],
    public teamId: Team['id'],
    public matchId: Match['id'],
    public name: 'earthshatter',
    public category: 'ultimate',
    public type1: 'lethal',
    public type2: 'mounting',
    public isActive: boolean,
    public power: number,
    public duration: number
  ) {
    super(name, teamId, whose, matchId, category, type1, type2, isActive);
    logger.info(ModuleInitLog, { filename: 'Earthshatter' });
  }

  async use(io: Namespace, redisService: RedisService) {
    if (this.isActive) {
      this.isActive = false;
      await updateMatchStatus(io, redisService, this);
    }
  }

  async to(
    io: Namespace,
    redisService: RedisService,
    target: Hero | Skill,
    callback: (io: Namespace, redisService: RedisService) => void
  ) {
    if (target.teamId !== this.teamId && target instanceof Hero) {
      await target.takeDamage(io, redisService, this.power, callback);
      await target.fellDown(io, redisService, this.duration);
    } else if (target.teamId !== this.teamId && target instanceof Skill) {
      await target.takeDamage(io, redisService, this.power);
    }
  }
}
