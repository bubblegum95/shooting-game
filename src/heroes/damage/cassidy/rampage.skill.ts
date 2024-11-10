import { Namespace } from 'socket.io';
import { RedisService } from '../../../services/redis.service';
import { Cassidy } from './cassidy.hero';
import { Hero } from '../../hero';
import { updateMatchStatus } from '../../updateMatchStatus';
import { ModuleInitLog, logger } from '../../../winston';
import { Skill } from '../../skill';
import { Player } from '../../../entities/player.entity';
import { Match } from '../../../entities/match.entity';
import { Team } from '../../../entities/team.entity';

export class Rampage extends Skill {
  constructor(
    public whose: Player['id'],
    public teamId: Team['id'],
    public matchId: Match['id'],
    public name: string,
    public category: 'secondary',
    public type1: 'lethal',
    public type2: 'mounting',
    public isActive: boolean,
    public cooltime: number,
    public term: number,
    public power: number,
    public point: number
  ) {
    super(name, teamId, whose, matchId, category, type1, type2, isActive);
    logger.info(ModuleInitLog, { filename: 'Rampage' });
  }

  async use(io: Namespace, redisService: RedisService, player: Cassidy) {
    const bullets = player.skills.peacekeeper.bullets;

    if (this.isActive && bullets > 1) {
      this.isActive = false;

      for (let i = 0; i < bullets; i++) {
        player.skills.peacekeeper.bullets -= 1;
        await updateMatchStatus(io, redisService, player);

        setTimeout(() => {}, this.term);
      }

      setTimeout(async () => {
        this.isActive = true;
        await updateMatchStatus(io, redisService, player);
      }, this.cooltime);
    }
  }

  async to(
    io: Namespace,
    redisService: RedisService,
    player: Cassidy,
    target: Hero | Skill,
    callback: (io: Namespace, redisService: RedisService) => Promise<void>
  ) {
    if (target instanceof Hero) {
    }
    target.takeDamage(io, redisService, this.power, callback);
    player.ultimate += this.point;
    updateMatchStatus(io, redisService, player);
  }
}
