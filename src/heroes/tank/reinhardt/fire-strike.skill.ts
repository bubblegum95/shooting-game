import { Namespace } from 'socket.io';
import { Skill } from '../../skill';
import { RedisService } from '../../../services/redis.service';
import { Reinhardt } from './reinhardt.hero';
import { updateMatchStatus } from '../../updateMatchStatus';
import { Hero } from '../../hero';
import { logger, ModuleInitLog } from '../../../winston';
import { Player } from '../../../entities/player.entity';
import { Match } from '../../../entities/match.entity';
import { Team } from '../../../entities/team.entity';

export class FireStrike extends Skill {
  constructor(
    public whose: Player['id'],
    public teamId: Team['id'],
    public matchId: Match['id'],
    public name: 'fireStrike',
    public category: 'secondary',
    public type1: 'lethal',
    public type2: 'mounting',
    public isActive: boolean,
    public cooltime: number,
    public power: number,
    public point: number
  ) {
    super(name, teamId, whose, matchId, category, type1, type2, isActive);
    logger.info(ModuleInitLog, { filename: 'FireStrike' });
  }

  async use(io: Namespace, redisService: RedisService, player: Reinhardt) {
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
    callback: (io: Namespace, redisService: RedisService) => Promise<void>
  ) {
    if (target instanceof Hero && target.teamId !== this.teamId) {
      await target.takeDamage(io, redisService, this.power, callback);
      player.ultimate += this.point;
      await updateMatchStatus(io, redisService, player);
    } else if (target instanceof Skill && target.teamId !== this.teamId) {
      await target.takeDamage(io, redisService, this.power);
    }
  }
}
