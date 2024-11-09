import { Namespace } from 'socket.io';
import { Skill } from '../../skill';
import { Reinhardt } from './reinhardt.hero';
import { RedisService } from '../../../services/redis.service';
import { updatePlayerStatus, updateSkillStatus } from '../../updateMatchStatus';
import { Hero } from '../../hero';
import { logger, ModuleInitLog } from '../../../winston';
import { Player } from '../../../entities/player.entity';
import { Match } from '../../../entities/match.entity';

export class RocketHammer extends Skill {
  constructor(
    public name: 'rocketHammer',
    public whose: Player['id'],
    public matchId: Match['id'],
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
    super(name, whose, matchId, category, type1, type2, isActive);
    logger.info(ModuleInitLog, { filename: 'RocketHammer' });
  }

  async use(io: Namespace, redisService: RedisService) {
    if (this.isActive) {
      this.isActive = false;
      await updateSkillStatus(io, redisService, this);

      setTimeout(async () => {
        this.isActive = true;
        await updateSkillStatus(io, redisService, this);
      }, this.cooltime);
    }
  }

  async to(
    io: Namespace,
    redisService: RedisService,
    player: Reinhardt,
    target: Hero,
    callback: (io: Namespace, redisService: RedisService) => void
  ) {
    await target.takeDamage(io, redisService, this.power, callback);
    player.ultimate += this.point;
    await updatePlayerStatus(io, redisService, player);
  }
}
