import { Namespace } from 'socket.io';
import { RedisService } from '../redis.service';
import { Hero } from './hero';
import { Match } from '../../entities/match.entity';

export const resetMatchStatus = async function (
  io: Namespace,
  redisService: RedisService,
  player: Hero
) {
  const resetHero = await redisService.setPlayerProperties(
    player.playerId,
    player
  );
  await matchStatus(io, redisService, player.matchId);
};

export const matchStatus = async function (
  io: Namespace,
  redisService: RedisService,
  matchId: Match['id']
) {
  const result = await redisService.getMatchStatus(matchId);
  io.to(matchId).emit('match:status:get', result);
  return result;
};
