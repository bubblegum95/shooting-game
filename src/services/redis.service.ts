import { Socket } from 'socket.io';
import { User } from '../entities/user.entity';
import { Player } from '../entities/player.entity';
import { Team } from '../entities/team.entity';
import { Match } from '../entities/match.entity';
import { ModuleInitLog, logger } from '../winston';
import { Hero } from '../heroes/hero';
import { Skill } from '../heroes/skill';
import { PropertyType } from '../types/player-status.type';
import { Redis } from 'ioredis';

export class RedisService {
  constructor(private redis: Redis) {
    logger.info(ModuleInitLog, { filename: 'RedisService' });
  }

  // ======== user socket n status =========
  async setUserSocket(userId: User['id'], socketId: Socket['id']) {
    this.redis.set(`user:${userId}:socket`, socketId);
  }

  async setUserStatus(userId: User['id'], status: 'online' | 'offline') {
    this.redis.set(`user:${userId}:status`, status);
  }

  async getUserSocket(userId: User['id']) {
    return await this.redis.get(`user:${userId}:socket`);
  }

  async deleteUserSocket(userId: User['id']) {
    this.redis.del(`user:${userId}:socket`); // 소켓 ID 정보 삭제
  }

  // ======== player's hero properties =========
  async setPropertyKeyInList(
    playerId: Player['id'],
    propertyK: string,
    type: PropertyType
  ) {
    await this.redis.lpush(
      `player:${playerId}:property`,
      `player:${playerId}:${propertyK}:${type}`
    );
  }

  async setProperty(playerId: Player['id'], propertyK: string, propertyV: any) {
    const type = PropertyType.Property;
    await this.redis.set(`player:${playerId}:${propertyK}:${type}`, propertyV);
    await this.setPropertyKeyInList(playerId, propertyK, type);
  }

  // ========== player's skill property ==========
  async setSkillPropertyKeyInList(
    playerId: Player['id'],
    skillName: string,
    propertyK: string
  ) {
    await this.redis.lpush(
      `${playerId}:skill:${skillName}:property`,
      `${playerId}:skill:${skillName}:${propertyK}`
    );
  }

  async setSkillProperty(
    playerId: Player['id'],
    skillName: Skill['name'],
    propertyK: string,
    propertyV: any
  ) {
    await this.redis.set(
      `${playerId}:skill:${skillName}:${propertyK}`,
      propertyV
    );
  }

  async setSkillProperties(
    playerId: Player['id'],
    skills: { [name: string]: Skill }
  ) {
    const type = PropertyType.Skill;

    for (const [name, skill] of Object.entries(skills)) {
      await this.setPropertyKeyInList(playerId, name, type);

      for (const [name, property] of Object.entries(skill)) {
        await this.setSkillProperty(playerId, skill.name, name, property);
        await this.setSkillPropertyKeyInList(playerId, skill.name, name);
      }
    }
  }

  async setPlayerProperties(playerId: Player['id'], player: Hero) {
    for (const [K, V] of Object.entries(player)) {
      if (K === 'skills') {
        const skills: { [name: string]: Skill } = V; // {[name: stirng]: Skill}
        await this.setSkillProperties(playerId, skills);
      } else {
        await this.setProperty(playerId, K, V);
      }
    }
  }

  async getSkillPropertyKeys(playerId: Player['id'], skillName: Skill['name']) {
    return await this.redis.lrange(
      `${playerId}:skill:${skillName}:property`,
      0,
      -1
    );
  }

  async getSkillPropertyV(propertyK: string) {
    return await this.redis.get(propertyK);
  }

  async getProperty(
    playerId: Player['id'],
    property: string,
    type: PropertyType
  ) {
    return await this.redis.get(`player:${playerId}:${property}:${type}`);
  }

  async getPropertyKeys(playerId: Player['id']) {
    return await this.redis.lrange(`player:${playerId}:property`, 0, -1);
  }

  //=========== team n match ======
  async setTeamPlayer(teamId: Team['id'], playerId: Player['id']) {
    this.redis.lpush(`team:${teamId}:players`, playerId);
  }

  async setMatchTeams(
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

  // 문제점: 스킬명을 모르면, 또는 타입이 스킬인지 모르면 리스트를 해당 리스크를 가져올 수 없음.
  // redis에는 타입이 매우 한정적임. 그리고 슬롯 해시 구조를 가지므로 슬롯 키값이 일정해야 함.
  // 그렇다면 키 값을 "player:playerId:status" -> "player:playerId:status:type" 이렇게 한다면???? type이 skill 인것만 가져와서 리스트 추출하기

  // 매칭 정보 가져오기
  async getMatchStatus(matchId: Match['id']) {
    let match = [];
    const teamList = await this.getMatchTeams(matchId);

    for (const teamId of teamList) {
      const playerList = await this.getTeamPlayers(teamId);

      for (const playerId of playerList) {
        let playerOb: { [key: string]: any; skills: { [name: string]: any } } =
          { skills: {} };

        const properties = await this.getPropertyKeys(playerId);
        for (const property of properties) {
          let propertyK = property.split(':')[2];
          let propertyT = property.split(':')[3];
          let skillOb: { [key: string]: any } = {};

          if (propertyT === 'property') {
            const property = await this.getProperty(
              playerId,
              propertyK,
              PropertyType.Property
            );
            playerOb[propertyK] = property;
          } else if (propertyT === 'skill') {
            const skillProperties = await this.getSkillPropertyKeys(
              playerId,
              propertyK
            );

            for (const skillProperty of skillProperties) {
              const skillPropertyK = skillProperty.split(':')[3];
              const skillPropertyV = await this.getSkillPropertyV(
                skillProperty
              );

              skillOb[skillPropertyK] = skillPropertyV;
            }
            playerOb.skills[propertyK] = skillOb;
          }
        }
        match.push(playerOb);
      }
    }
    console.log('match status:', match);
    return match;
  }
}
