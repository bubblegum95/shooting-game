import { Namespace } from 'socket.io';
import { RedisService } from '../services/redis.service';
import { Hero } from './hero';
import { Match } from '../entities/match.entity';
import { Skill } from './skill';

export const updatePlayerStatus = async function (
  io: Namespace,
  redisService: RedisService,
  player: Hero
) {
  await redisService.setPlayerProperties(player.playerId, player);
  await matchStatus(io, redisService, player.matchId);
};

export const updateSkillStatus = async function (
  io: Namespace,
  redisService: RedisService,
  skill: Skill
) {
  await redisService.setSkillProperties(skill.whose, skill);
  await matchStatus(io, redisService, skill.matchId);
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
