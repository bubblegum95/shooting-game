import { Namespace, Socket } from 'socket.io';
import { User } from '../entities/user.entity';
import { Heroes } from '../types/heroes.type';
import redis from '../redis/redis';
import { GameService } from '../services/game.service';
import { Match } from '../entities/match.entity';
import { Team } from '../entities/team.entity';
import { Player } from '../entities/player.entity';
import { ModuleInitLog, logger } from '../winston';
import { Callback } from 'typeorm';

export class GameGateway {
  private logname = { filename: 'GameGateway' };

  constructor(private io: Namespace, private gameService: GameService) {
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
        await this.gameService.setUserSocketInRedis(userId, socket.id);
        await this.gameService.setUserStatusInRedis(userId, 'online');
      }

      // 클라이언트 연결 종료
      socket.on('disconnect', () => {
        logger.debug(`Clients socket disconnected: socket.id`, this.logname);

        redis.set(`user:${userId}:status`, 'offline');
        redis.del(`user:${userId}:socket`); // 소켓 ID 정보 삭제
      });

      // 매칭 및 팀 생성 및 초대
      socket.on(
        'matchingGame',
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
          this.io.to(matchId).emit('getMatchStatus', status);
        }
      );

      // 매칭 초대 확인
      socket.on(
        'invitingGame',
        (dto: { matchId: Match['id']; owner: User['id'] }) => {
          const { matchId, owner } = dto;
          socket.emit('invitedGame', matchId, owner);
        }
      );

      // 매칭 초대 수락 및 팀 편성
      socket.on(
        'acceptInvitation',
        async (dto: { userId: User['id']; matchId: Match['id'] }) => {
          const { userId, matchId } = dto;
          await this.gameService.acceptInvitation(socket, userId, matchId);
          const status = await this.getMatchStatus(matchId);
          this.io.to(matchId).emit('getMatchStatus', status);
        }
      );

      // 경기 종료
      socket.on(
        'gameOver',
        async (dto: { matchId: Match['id']; teamId: Team['id'] }) => {
          const { matchId, teamId } = dto;
          await this.gameService.gameOver(socket, matchId, teamId);
          await this.getMatchStatus(matchId);
          this.io.to(matchId).emit('getMatchStatus');
        }
      );

      // 영웅 선택
      socket.on(
        'choiceHero',
        async (dto: {
          matchId: Match['id'];
          playerId: Player['id'];
          heroName: keyof typeof Heroes;
        }) => {
          const { matchId, playerId, heroName } = dto;
          const hero = await this.gameService.chooseHero(playerId, heroName);
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
    const matchId = await this.gameService.initMatch(ownerId, type);
    await this.gameService.participateTeam(socket, ownerId, matchId);

    for (const userId of users) {
      const socketId = await this.gameService.getUserSocketInRedis(userId);
      if (socketId) {
        const owner = await this.gameService.findUser(ownerId);
        const data = {
          matchId,
          inviter: owner?.username,
        };
        this.io.to(socketId).emit('invitingGame', data);
      }
    }
    return matchId;
  }

  async getMatchStatus(matchId: Match['id']) {
    return this.gameService.getMatchStatus(matchId);
  }

  // 히어로 액션 통제 -> 행하는 주체, 행함, 타겟
  async getHeroesAction(
    socket: Socket,
    matchId: Match['id'],
    playerId: Player['id'],
    skill: string,
    targetId: Player['id']
  ) {
    // 레디스에서 히어로에 대한 객체 정보 모두 불러오기 -> 메서드 사용 -> 행위에 따른 상대 변화 적용하기
    const player = await this.gameService.getPlayerObject(playerId);
    const target = await this.gameService.getPlayerObject(targetId);
    const playerType: keyof typeof Heroes = player.name;
    const targetType: keyof typeof Heroes = target.name;
    const playerHero = Heroes[playerType];
    const targetHero = Heroes[targetType];

    const result = playerHero.useSkill(socket, matchId, skill, targetHero);
  }
}
