import { Socket } from 'socket.io';
import { CreateMemberDto } from '../dto/create-member.dto';
import { Match } from '../entities/match.entity';
import { Player } from '../entities/player.entity';
import { Team } from '../entities/team.entity';
import { User } from '../entities/user.entity';
import { Heroes } from '../types/heroes.type';
import { MatchService } from './match.service';
import { PlayerService } from './player.service';
import { RedisService } from './redis.service';
import { TeamService } from './team.service';
import { UserService } from './user.service';
import { AppDataSource } from '../data-source';
import { MatchStatus } from '../types/match-status.type';

export class GameService {
  constructor(
    private matchService: MatchService,
    private redisService: RedisService,
    private userService: UserService,
    private playerService: PlayerService,
    private teamService: TeamService
  ) {}

  async createMatch(
    ownerId: User['id'],
    type: keyof typeof BattleField,
    password?: string
  ) {
    try {
      return await this.initMatch(ownerId, type, password);
    } catch (error) {
      throw error;
    }
  }

  async getMatchList(page: number, limit: number) {
    return this.matchService.find(page, limit);
  }

  async invitePlayers(dto: {
    matchId: Match['id'];
    inviter: User['id'];
    invitee: User['id'];
  }) {
    const { matchId, inviter, invitee } = dto;
    try {
      const existUser = await this.findUser(inviter);
      if (!existUser) {
        throw new Error('사용자가 존재하지 않습니다.');
      }
      const foundMatch = await this.matchService.findOne(matchId);
      if (!foundMatch) {
        throw new Error('해당 게임이 존재하지 않습니다.');
      }
      const foundUser = await this.findUser(invitee);
      if (!foundUser) {
        throw new Error(`${invitee}님이 존재하지 않습니다.`);
      }
      const socketId = await this.redisService.getUserSocket(invitee);
      if (!socketId) {
        throw new Error(`${foundUser?.username}님이 오프라인입니다.`);
      }
      const invitation = {
        matchId: foundMatch.id,
        password: foundMatch.password,
        inviter: existUser.username,
        invitee: socketId,
      };
      return invitation;
    } catch (error) {
      throw error;
    }
  }

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

  async findTeam(matchId: Match['id']) {
    return this.teamService.find(matchId);
  }

  async findMatch(matchId: Match['id']) {
    return this.matchService.findOne(matchId);
  }

  async chooseHero(playerId: Player['id'], heroName: string) {
    try {
      const player = await this.findPlayer(playerId);
      if (!player) {
        throw new Error('플레이어가 존재하지 않습니다.');
      }

      const hero = Heroes(heroName, player.matchId, player.teamId, playerId);
      await this.redisService.setPlayerProperties(playerId, hero);
      await this.redisService.setTeamPlayer(player.teamId, playerId);
      return hero;
    } catch (error) {
      throw error;
    }
  }

  async participateTeam(
    socket: Socket,
    userId: User['id'],
    matchId: Match['id']
  ) {
    try {
      let teamId = '';
      let playerList = [];
      const teams = await this.findTeam(matchId);

      for (const team of teams) {
        for (const player of team.players) {
          playerList.push(player.userId);
        }
        if (team.players.length >= 5) {
          continue;
        }
        teamId = team.id;
      }

      if (!teamId) {
        throw new Error('전장에 정원이 가득 찼습니다.');
      }
      if (playerList.includes(userId)) {
        throw new Error('해당 플레이어가 이미 참전중입니다.');
      }
      const player = await this.createPlayer({ matchId, teamId, userId });
      if (!player) {
        throw new Error('플레이어를 생성할 수 없습니다.');
      }

      socket.join(matchId);
      socket.join(teamId);
      socket.emit('message', '전장에 오신 것을 환영합니다.');
      socket.emit('match:participate', { matchId, teamId, player });

      return player;
    } catch (error) {
      throw error;
    }
  }

  async initMatch(
    ownerId: User['id'],
    type: keyof typeof BattleField,
    password?: string
  ) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const match = await queryRunner.manager.save(Match, {
        ownerId,
        type,
        password,
      });
      const team1 = await queryRunner.manager.save(Team, { matchId: match.id });
      const team2 = await queryRunner.manager.save(Team, { matchId: match.id });
      await queryRunner.commitTransaction();
      await this.redisService.setMatchTeams(match.id, team1.id, team2.id);
      return match;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async participateMatch(
    socket: Socket,
    userId: User['id'],
    matchId: string,
    password: Match['password']
  ) {
    try {
      const match = await this.matchService.findOne(matchId);
      if (!match) {
        throw new Error('해당 경기가 존재하지 않습니다.');
      } else {
        if (match.status === MatchStatus.Over) {
          throw new Error('해당 경기가 종료되었습니다.');
        }
        if (password !== match.password) {
          throw new Error('비밀번호가 일치하지 않습니다.');
        }
        await this.participateTeam(socket, userId, match.id);
      }
    } catch (error) {
      throw error;
    }
  }

  async gameOver(matchId: Match['id']) {
    await this.matchService.changeOver(matchId);
  }

  async leaveGame(socket: Socket, matchId: Match['id'], teamId: Team['id']) {
    socket.leave(matchId);
    socket.leave(teamId);
  }

  async gameStart(socket: Socket, matchId: Match['id'], userId: User['id']) {
    try {
      const existMatch = await this.matchService.findOne(matchId);
      if (existMatch?.ownerId !== userId) {
        throw new Error('경기 시작은 방장만 가능합니다.');
      }
      if (existMatch?.status === MatchStatus.Ready) {
        await this.matchService.changeStart(matchId);
      }
    } catch (error) {
      throw error;
    }
  }
}
