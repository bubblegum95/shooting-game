import { Socket } from 'socket.io';
import { User } from '../entities/user.entity';
import { Player } from '../entities/player.entity';
import { Team } from '../entities/team.entity';
import { Match } from '../entities/match.entity';
import { ModuleInitLog, logger } from '../winston';
import { Redis } from 'ioredis';
import { Hero } from './heroes/hero';
import { Status } from '../types/player-status.type';
import { Skill } from './heroes/skill';

export class RedisService {
  constructor(private redis: Redis) {
    logger.info(ModuleInitLog, { filename: 'RedisService' });
  }
  // ======== user socket n status =========
  async setUserSocket(userId: User['id'], socketId: Socket['id']) {
    this.redis.set(`user:${userId}:socket`, socketId);
  }

  async getUserSocket(userId: User['id']) {
    return await this.redis.get(`user:${userId}:socket`);
  }

  async setUserStatus(userId: User['id'], status: 'online' | 'offline') {
    this.redis.set(`user:${userId}:status`, status);
  }

  // ======== player's hero properties =========
  async setPlayerStatusInList(
    playerId: Player['id'],
    key: string,
    type: Status
  ) {
    await this.redis.lpush(
      `player:${playerId}:status`,
      `player:${playerId}:${key}:${type}`
    );
  }

  async setPlayerStatusProperty(
    playerId: Player['id'],
    key: string,
    status: any
  ) {
    const type = Status.Property;
    await this.redis.set(`player:${playerId}:${key}:${type}`, status);
    await this.setPlayerStatusInList(playerId, key, type);
  }

  async setPlayerSkillStatusInList(
    playerId: Player['id'],
    skillName: string,
    status: string
  ) {
    await this.redis.lpush(
      `${playerId}:skill:${skillName}:status`,
      `${playerId}:skill:${skillName}:${status}`
    );
  }

  async setPlayerStatusSkill(playerId: Player['id'], skill: Skill) {
    for (const [K, V] of Object.entries(skill)) {
      await this.redis.set(`${playerId}:skill:${skill.name}:${K}`, V);
      await this.setPlayerSkillStatusInList(playerId, skill.name, K);
    }
    const type = Status.Skill;
    await this.setPlayerStatusInList(playerId, skill.name, type);
  }

  async setAllPlayerStatuses(playerId: Player['id'], player: Hero) {
    for (const [key, status] of Object.entries(player)) {
      if (status === Skill) {
        await this.setPlayerStatusSkill(playerId, status);
      } else {
        await this.setPlayerStatusProperty(playerId, key, status);
      }
    }
  }

  async getAllPlayerSkillStatus(
    playerId: Player['id'],
    skillName: Skill['name']
  ) {
    return await this.redis.lrange(
      `${playerId}:skill:${skillName}:status`,
      0,
      -1
    );
  }

  async getPlayerStatus(playerId: Player['id'], status: string, type: Status) {
    return await this.redis.get(`player:${playerId}:${status}:${type}`);
  }

  async getAllPlayerStatuses(playerId: Player['id']) {
    return await this.redis.lrange(`player:${playerId}:status`, 0, -1);
  }

  // 문제점: 스킬명을 모르면, 또는 타입이 스킬인지 모르면 리스트를 해당 리스크를 가져올 수 없음.
  // redis에는 타입이 매우 한정적임. 그리고 슬롯 해시 구조를 가지므로 슬롯 키값이 일정해야 함.
  // 그렇다면 키 값을 "player:playerId:status" -> "player:playerId:status:type" 이렇게 한다면???? type이 skill 인것만 가져와서 리스트 추출하기

  //=========== team n match ======
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

  async getMatchStatus(matchId: Match['id']) {
    let match = [];
    const teamList = await this.getMatchTeams(matchId);

    for (const teamId of teamList) {
      let team = [];
      const playerList = await this.getTeamPlayers(teamId);

      for (const playerId of playerList) {
        let playerStatus: { [key: string]: any } = {};
        const statusList = await this.getAllPlayerStatuses(playerId);

        for (const status of statusList) {
          let skillStatusOb: { [key: string]: any } = {};
          let statusName = status.split(':')[2];
          let type = status.split(':')[3];

          if (type === Status.Skill) {
            const skillStatusList = await this.getAllPlayerSkillStatus(
              playerId,
              statusName
            );

            for (const skillStatus of skillStatusList) {
              const skillstatusName = skillStatus.split(':')[3];
              const skillstatusValue = this.redis.get(skillStatus);
              skillStatusOb[skillstatusName] = skillstatusValue;
            }
            playerStatus[statusName] = skillStatusOb;
          } else if (type === Status.Property) {
            const property = await this.getPlayerStatus(playerId, status, type);
            playerStatus[statusName] = property;
          }
        }
        team.push({ playerId: playerStatus });
      }
      match.push({ teamId: team });
    }
    return { matchId: match };
  }
}
