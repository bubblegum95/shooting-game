import { Hero } from '../../hero';
import { ModuleInitLog, logger } from '../../../winston';
import { Namespace } from 'socket.io';
import { RedisService } from '../../../services/redis.service';
import { Ana } from './ana.hero';
import { updateMatchStatus } from '../../updateMatchStatus';
import { Skill } from '../../skill';
import { Player } from '../../../entities/player.entity';
import { Match } from '../../../entities/match.entity';
import { Team } from '../../../entities/team.entity';

export class SleepDart extends Skill {
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
    public duration: number,
    public power: number,
    public point: number
  ) {
    super(name, whose, teamId, matchId, category, type1, type2, isActive);
    logger.info(ModuleInitLog, { filename: 'SleepDart' });
  }

  async use(io: Namespace, redisService: RedisService, player: Ana) {
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
    player: Ana,
    target: Hero | Skill,
    callback: (io: Namespace, redisService: RedisService) => Promise<void>
  ) {
    if (player.teamId !== target.teamId && target instanceof Hero) {
      await target.sleep(io, redisService, player, this.duration);
      await target.takeDamage(io, redisService, this.power, callback);
      player.ultimate += this.point;
      await updateMatchStatus(io, redisService, player);
    } else if (player.teamId !== target.teamId && target instanceof Skill) {
      await target.takeDamage(io, redisService, this.power);
    }
  }
}

Hero.prototype.sleep = async function (
  io: Namespace,
  redisService: RedisService,
  player: Hero,
  duration: number
) {
  if (this.isAlive) {
    this.isAsleep = true;
    console.log(`${this.name} is now asleep.`);
    await updateMatchStatus(io, redisService, this);

    setTimeout(async () => {
      this.isAsleep = false;
      await updateMatchStatus(io, redisService, player);
      console.log(`${this.name} woke up.`);
    }, duration);
  }
};
