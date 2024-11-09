import { Namespace } from 'socket.io';
import { Skill } from '../../skill';
import { RedisService } from '../../../services/redis.service';
import { Ana } from './ana.hero';
import { updateMatchStatus } from '../../updateMatchStatus';
import { Player } from '../../../entities/player.entity';
import { Match } from '../../../entities/match.entity';

export class Scope extends Skill {
  constructor(
    public name: string,
    public whose: Player['id'],
    public matchId: Match['id'],
    public category: 'secondary',
    public type1: 'mixed',
    public type2: 'mounting',
    public isActive: boolean
  ) {
    super(name, whose, matchId, category, type1, type2, isActive);
  }

  async use(io: Namespace, redisService: RedisService, player: Ana) {
    player.zoomIn(io, redisService);
  }

  async noUse(io: Namespace, redisService: RedisService, player: Ana) {
    player.zoomOut(io, redisService);
  }
}

Ana.prototype.zoomIn = async function (
  io: Namespace,
  redisService: RedisService
) {
  this.isUsingScope = true;
  this.speed /= 2;
  await updateMatchStatus(io, redisService, this);
};

Ana.prototype.zoomOut = async function (
  io: Namespace,
  redisService: RedisService
) {
  this.isUsingScope = false;
  this.speed *= 2;
  await updateMatchStatus(io, redisService, this);
};
