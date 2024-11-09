import { Namespace } from 'socket.io';
import { Skill } from '../../skill';
import { RedisService } from '../../../services/redis.service';
import { Ana } from './ana.hero';
import { updateMatchStatus } from '../../updateMatchStatus';
import { Player } from '../../../entities/player.entity';
import { Match } from '../../../entities/match.entity';
import { Team } from '../../../entities/team.entity';

export class Scope extends Skill {
  constructor(
    public whose: Player['id'],
    public teamId: Team['id'],
    public matchId: Match['id'],
    public name: string,
    public category: 'secondary',
    public type1: 'mixed',
    public type2: 'mounting',
    public isActive: boolean,
    public isUsing: boolean
  ) {
    super(name, whose, teamId, matchId, category, type1, type2, isActive);
  }

  async use(io: Namespace, redisService: RedisService, player: Ana) {
    if (!this.isUsing) {
      player.zoomIn(io, redisService);
    } else {
      player.zoomOut(io, redisService);
    }
  }
}

Ana.prototype.zoomIn = async function (
  io: Namespace,
  redisService: RedisService
) {
  this.speed /= 2;
  await updateMatchStatus(io, redisService, this);
};

Ana.prototype.zoomOut = async function (
  io: Namespace,
  redisService: RedisService
) {
  this.speed *= 2;
  await updateMatchStatus(io, redisService, this);
};
