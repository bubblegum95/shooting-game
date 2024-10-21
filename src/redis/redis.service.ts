import { Socket } from 'socket.io';
import { User } from '../entities/user.entity';
import redis from './redis';
import { Player } from '../entities/player.entity';
import { Team } from '../entities/team.entity';
import { Match } from '../entities/match.entity';
import { ModuleInitLog, logger } from '../winston';
import { Redis } from 'ioredis';

export class RedisService {
  constructor(private redis: Redis) {
    logger.info(ModuleInitLog, { filename: 'RedisService' });
  }

  async setUserSocket(userId: User['id'], socketId: Socket['id']) {
    this.redis.set(`user:${userId}:socket`, socketId);
  }

  async setUserStatus(userId: User['id'], status: 'online' | 'offline') {
    this.redis.set(`user:${userId}:status`, status);
  }

  async getUserSocket(userId: User['id']) {
    return await this.redis.get(`user:${userId}:socket`);
  }

  async setPlayerStatus(
    playerId: Player['id'],
    statusKey: string,
    status: any
  ) {
    await this.redis.set(`player:${playerId}:${statusKey}`, status);
    await this.redis.lpush(
      `player:${playerId}:status`,
      `player:${playerId}:${statusKey}`
    );
  }

  async setTeamPlayer(teamId: Team['id'], playerId: Player['id']) {
    this.redis.lpush(`team:${teamId}:players`, playerId);
  }

  async setMatchTeamsInRedis(
    matchId: Match['id'],
    team1: Team['id'],
    team2: Team['id']
  ) {
    this.redis.lpush(`match:${matchId}:teams`, team1, team2);
  }

  async getMatchTeams(matchId: Match['id']) {
    return await this.redis.lrange(`match:${matchId}:teams`, 0, -1);
  }

  async getTeamPlayers(teamId: Team['id']) {
    return await this.redis.lrange(`team:${teamId}:players`, 0, -1);
  }

  async getPlayerStatuses(playerId: Player['id']) {
    return await this.redis.lrange(`player:${playerId}:status`, 0, -1);
  }

  async getPlayerStatus(status: string) {
    return await this.redis.get(status);
  }

  async getPlayerObject(playerId: Player['id']) {
    const statuses = await this.getPlayerStatuses(playerId);
    let playerObject: { [key: string]: any } = {};

    for (const status of statuses) {
      const value = await this.getPlayerStatus(status);
      const key = status.split(':')[2];
      playerObject[key] = value;
    }

    return playerObject;
  }
}
