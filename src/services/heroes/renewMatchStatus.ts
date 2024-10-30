import { Namespace } from 'socket.io';
import { RedisService } from '../redis.service';
import { Hero } from './hero';

export const renewMatchStatus = async function (
  io: Namespace,
  redisService: RedisService,
  player: Hero
) {
  await redisService.setAllPlayerStatuses(player.playerId, player);
  const result = await redisService.getMatchStatus(player.matchId);
  io.to(player.matchId).emit('match:status:get', result);
};
