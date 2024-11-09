import { Namespace } from 'socket.io';
import { Skill } from '../../skill';
import { Reinhardt } from './reinhardt.hero';
import { RedisService } from '../../../services/redis.service';
import { updateMatchStatus } from '../../updateMatchStatus';
import { Hero } from '../../hero';
import { logger, ModuleInitLog } from '../../../winston';
import { Player } from '../../../entities/player.entity';
import { Match } from '../../../entities/match.entity';
import { Team } from '../../../entities/team.entity';

export class RocketHammer extends Skill {
  constructor(
    public whose: Player['id'],
    public teamId: Team['id'],
    public matchId: Match['id'],
    public name: 'rocketHammer',
    public category: 'primary',
    public type1: 'lethal',
    public type2: 'mounting',
    public isActive: boolean,
    public power: number,
    public speed: number,
    public range: number,
    public point: number,
    public cooltime: number
  ) {
    super(name, whose, teamId, matchId, category, type1, type2, isActive);
    logger.info(ModuleInitLog, { filename: 'RocketHammer' });
  }

  async use(io: Namespace, redisService: RedisService) {
    if (this.isActive) {
      this.isActive = false;
      await updateMatchStatus(io, redisService, this);

      setTimeout(async () => {
        this.isActive = true;
        await updateMatchStatus(io, redisService, this);
      }, this.cooltime);
    }
  }

  async to(
    io: Namespace,
    redisService: RedisService,
    player: Reinhardt,
    target: Hero | Skill,
    callback: (io: Namespace, redisService: RedisService) => void
  ) {
    if (target instanceof Hero && target.teamId !== this.teamId) {
      await target.takeDamage(io, redisService, this.power, callback);
      player.ultimate += this.point;
      await updateMatchStatus(io, redisService, player);
    } else if (target.teamId !== this.teamId && target instanceof Skill) {
      await target.takeDamage(io, redisService, this.power);
    }
  }
}
