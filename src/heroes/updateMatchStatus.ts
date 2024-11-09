import { Namespace } from 'socket.io';
import { RedisService } from '../services/redis.service';
import { Hero } from './hero';
import { Match } from '../entities/match.entity';
import { Skill } from './skill';

export const updateMatchStatus = async function (
  io: Namespace,
  redisService: RedisService,
  player: Hero | Skill
) {
  if (player instanceof Hero) {
    await redisService.setPlayerProperties(player.playerId, player);
  } else if (player instanceof Skill) {
  }
  await matchStatus(io, redisService, player.matchId);
};

export const matchStatus = async function (
  io: Namespace,
  redisService: RedisService,
  matchId: Match['id']
) {
  const result = await redisService.getMatchStatus(matchId);
  io.in(matchId).emit('match:status:get', result);
  return result;
};
