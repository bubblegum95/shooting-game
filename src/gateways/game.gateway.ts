import { Namespace, Socket } from 'socket.io';
import { User } from '../entities/user.entity';
import redis from '../redis/redis';
import { Match } from '../entities/match.entity';
import { Team } from '../entities/team.entity';
import { Player } from '../entities/player.entity';
import { ModuleInitLog, logger } from '../winston';
import { RedisService } from '../services/redis.service';
import { MatchService } from '../services/match.service';
import { TeamService } from '../services/team.service';
import { PlayerService } from '../services/player.service';
import { UserService } from '../services/user.service';
import { MatchStatus } from '../types/match-status.type';
import { CreateMemberDto } from '../dto/create-member.dto';
import { HeroName } from '../types/hero-name.type';
import { Heroes } from '../types/heroes.type';

export class GameGateway {
  private logname = { filename: 'GameGateway' };

  constructor(
    private io: Namespace,
    private matchService: MatchService,
    private teamService: TeamService,
    private playerService: PlayerService,
    private userService: UserService,
    private redisService: RedisService
  ) {
    this.setupListeners();
    logger.info(ModuleInitLog, this.logname);
  }

  private setupListeners() {
    // 소켓 연결
    this.io?.on('connection', async (socket) => {
      logger.debug(`Clients socket connected: socket.id`, this.logname);
      const userId = socket.handshake.query.userId;

      // Redis를 사용하여 소켓 연결 상태를 저장 및 관리
      if (userId && typeof userId === 'string') {
        await this.redisService.setUserSocket(userId, socket.id);
        await this.redisService.setUserStatus(userId, 'online');
      } else if (!userId) {
        socket.emit('server:error', '사용자 정보를 확인할 수 없습니다.');
        throw new Error('사용자 정보를 확인할 수 없습니다.');
      }

      socket.on('message', () => {
        socket.emit('message', 'welcome to overwatch mini world!');
      });

      // 클라이언트 연결 종료
      socket.on('disconnect', () => {
        logger.debug(`Clients socket disconnected: ${socket.id}`, this.logname);

        redis.set(`user:${userId}:status`, 'offline');
        redis.del(`user:${userId}:socket`); // 소켓 ID 정보 삭제
      });

      // 매칭 및 팀 생성 및 초대
      socket.on(
        'match:status:create',
        async (dto: {
          owner: User['id'];
          battleField: keyof typeof BattleField;
          users: User['id'][];
        }) => {
          const { owner, battleField, users } = dto;
          const matchId = await this.matchGame(
            socket,
            owner,
            battleField,
            users
          );
          const status = await this.getMatchStatus(matchId);
          this.io.to(matchId).emit('match:status:get', status);
        }
      );

      // 매칭 초대 확인
      socket.on(
        'match:invitation:send',
        (dto: { matchId: Match['id']; owner: User['id'] }) => {
          const { matchId, owner } = dto;
          socket.emit('match:invitation:confirm', matchId, owner);
        }
      );

      // 매칭 초대 수락 및 팀 편성
      socket.on(
        'match:inviation:accept',
        async (dto: { userId: User['id']; matchId: Match['id'] }) => {
          const { userId, matchId } = dto;
          await this.acceptInvitation(socket, userId, matchId);
          const status = await this.getMatchStatus(matchId);
          this.io.to(matchId).emit('match:status:get', status);
        }
      );

      // 경기 종료
      socket.on(
        'match:status:over',
        async (dto: { matchId: Match['id']; teamId: Team['id'] }) => {
          const { matchId, teamId } = dto;
          await this.gameOver(socket, matchId, teamId);
          await this.getMatchStatus(matchId);
          this.io.to(matchId).emit('match:status:get');
        }
      );

      // 영웅 선택
      socket.on(
        'match:hero:choice',
        async (dto: {
          matchId: Match['id'];
          teamId: Team['id'];
          playerId: Player['id'];
          heroName: HeroName;
        }) => {
          const { matchId, teamId, playerId, heroName } = dto;
          const hero = await this.chooseHero(
            matchId,
            teamId,
            playerId,
            heroName
          );
          const matchStatus = await this.getMatchStatus(matchId);
          socket.emit('createHero', hero);
          this.io.to(matchId).emit('getMatchStatus', matchStatus);
        }
      );
    });
  }

  async matchGame(
    socket: Socket,
    ownerId: User['id'],
    type: keyof typeof BattleField,
    users: User['id'][]
  ) {
    const matchId = await this.initMatch(ownerId, type);
    await this.participateTeam(socket, ownerId, matchId);

    for (const userId of users) {
      const socketId = await this.redisService.getUserSocket(userId);
      if (socketId) {
        const owner = await this.findUser(ownerId);
        const data = {
          matchId,
          inviter: owner?.username,
        };
        this.io.to(socketId).emit('invitingGame', data);
      }
    }
    return matchId;
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

  async createTeam(matchId: Match['id']): Promise<Team> {
    return this.teamService.create(matchId);
  }

  async findTeam(matchId: Match['id']) {
    return this.teamService.find(matchId);
  }

  async createMatch(ownerId: User['id'], type: keyof typeof BattleField) {
    return this.matchService.create(ownerId, type);
  }

  // ==================== status ==========================
  async getMatchStatus(matchId: Match['id']) {
    return this.redisService.getMatchStatus(matchId);
  }

  async chooseHero(
    matchId: Match['id'],
    teamId: Team['id'],
    playerId: Player['id'],
    heroName: HeroName
  ) {
    const player = await this.findPlayer(playerId);

    if (player) {
      const hero = Heroes(heroName, matchId, teamId, playerId);
      await this.redisService.setAllPlayerStatuses(playerId, hero);
      await this.redisService.setTeamPlayer(teamId, playerId);
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
