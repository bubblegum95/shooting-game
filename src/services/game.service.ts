import { Heroes } from '../types/heroes.type';
import { CreateMemberDto } from '../dto/create-member.dto';
import { User } from '../entities/user.entity';
import { Socket } from 'socket.io';
import { MatchService } from './match.service';
import { MatchStatus } from '../types/match-status.type';
import { PlayerService } from './player.service';
import { TeamService } from './team.service';
import { RedisService } from '../redis/redis.service';
import { UserService } from './user.service';
import { Player } from '../entities/player.entity';
import { Match } from '../entities/match.entity';
import { Team } from '../entities/team.entity';

export class GameService {
  constructor(
    private matchService: MatchService,
    private teamService: TeamService,
    private playerService: PlayerService,
    private userService: UserService,
    private redisService: RedisService
  ) {}

  async findUser(id: User['id']) {
    return await this.userService.findUser(id);
  }

  async createPlayer(dto: CreateMemberDto): Promise<Player> {
    try {
      const { matchId, teamId, userId } = dto;
      const player = this.playerService.create(matchId, teamId, userId);
      return player;
    } catch (error) {
      throw error;
    }
  }

  async findPlayer(playerId: Player['id']) {
    return this.playerService.findOne(playerId);
  }

  async createTeam(matchId: Match['id']): Promise<Team> {
    return this.teamService.create(matchId);
  }

  async findTeam(matchId: Match['id']) {
    return this.teamService.find(matchId);
  }

  async createMatch(ownerId: User['id'], type: keyof typeof BattleField) {
    return this.matchService.create(ownerId, type);
  }

  // ================ redis =====================
  async setUserSocketInRedis(userId: User['id'], socketId: Socket['id']) {
    await this.redisService.setUserSocket(userId, socketId);
  }

  async setUserStatusInRedis(userId: User['id'], status: 'online' | 'offline') {
    await this.redisService.setUserStatus(userId, status);
  }

  async getUserSocketInRedis(userId: User['id']) {
    return await this.redisService.getUserSocket(userId);
  }

  async getPlayerObject(playerId: Player['id']) {
    return await this.redisService.getPlayerObject(playerId);
  }

  // ==================== status ==========================
  async getMatchStatus(matchId: Match['id']) {
    let match = [];
    const teams = await this.redisService.getMatchTeams(matchId);

    for (const teamId of teams) {
      let team = [];
      const players = await this.redisService.getTeamPlayers(teamId);

      for (const playerId of players) {
        let playerStatus: { [key: string]: any } = {};
        const player = await this.redisService.getPlayerStatuses(playerId);

        for (const status of player) {
          const property = await this.redisService.getPlayerStatus(status);
          const propertyKey = status.split(':')[2];
          playerStatus[propertyKey] = property;
        }

        team.push({ playerId: playerStatus });
      }
      match.push({ teamId: team });
    }
    return { matchId: match };
  }

  async chooseHero(playerId: Player['id'], heroName: keyof typeof Heroes) {
    const player = await this.findPlayer(playerId);

    if (player) {
      const hero = typeof Heroes[heroName];
      for (const [statusKey, status] of hero) {
        await this.redisService.setPlayerStatus(playerId, statusKey, status);
      }
      await this.redisService.setTeamPlayer(player.teamId, playerId);
      return hero;
    }
  }

  async participateTeam(
    socket: Socket,
    userId: User['id'],
    matchId: Match['id']
  ) {
    try {
      let joined = false;
      const teams = await this.findTeam(matchId);

      for (const team of teams) {
        if (team.players.length <= 5) {
          const teamId = team.id;
          const player = await this.createPlayer({ matchId, teamId, userId });

          socket.join(matchId);
          socket.join(teamId);
          socket.emit('message', 'system: 전장에 오신 것을 환영합니다.');
          joined = true;
          break;
        }
      }

      if (joined === false) {
        socket.emit('error', 'system: 전장에 정원이 가득 찼습니다.');
      }
    } catch (error) {
      throw error;
    }
  }

  async initMatch(ownerId: User['id'], type: keyof typeof BattleField) {
    const match = await this.createMatch(ownerId, type);
    const team1 = await this.createTeam(match.id);
    const team2 = await this.createTeam(match.id);

    await this.redisService.setMatchTeamsInRedis(match.id, team1.id, team2.id);

    return match.id;
  }

  async acceptInvitation(socket: Socket, userId: User['id'], matchId: string) {
    const match = await this.matchService.findOne(matchId);
    if (!match) {
      socket.emit('error', '해당 경기가 존재하지 않습니다.');
    } else {
      if (match.status === MatchStatus.Over) {
        socket.emit('error', '해당 경기가 종료되었습니다.');
      }
      await this.participateTeam(socket, userId, match.id);
    }
  }

  async gameOver(socket: Socket, matchId: string, teamId: string) {
    socket.leave(matchId);
    socket.leave(teamId);
  }
}
