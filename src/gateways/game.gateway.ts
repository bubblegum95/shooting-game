import { Namespace } from 'socket.io';
import { User } from '../entities/user.entity';
import { Match } from '../entities/match.entity';
import { Player } from '../entities/player.entity';
import { ModuleInitLog, logger } from '../winston';
import { RedisService } from '../services/redis.service';
import { matchStatus, updateSkillStatus } from '../heroes/updateMatchStatus';
import { CreateMatchDto } from '../dto/create-match.dto';
import { GameService } from '../services/game.service';
import { MatchStatus } from '../types/match-status.type';
import { BattleFieldEnum } from '../types/battle-field.enum';

export class GameGateway {
  private logname = { filename: 'GameGateway' };

  constructor(
    private io: Namespace,
    private redisService: RedisService,
    private gameService: GameService
  ) {
    this.setupListeners();
    logger.info(ModuleInitLog, this.logname);
  }

  private setupListeners() {
    // 소켓 연결
    this.io?.on('connection', async (socket) => {
      logger.debug(`Clients socket connected: socket.id`, this.logname);
      const userId = socket.handshake.query.userId;

      if (userId && typeof userId === 'string') {
        await this.redisService.setUserSocket(userId, socket.id);
        await this.redisService.setUserStatus(userId, 'online');
      } else if (!userId || userId !== 'string') {
        socket.emit('error', '사용자 정보를 확인할 수 없습니다.');
        throw new Error('사용자 정보를 확인할 수 없습니다.');
      }

      // 클라이언트 연결 종료
      socket.on('disconnect', () => {
        logger.debug(`Clients socket disconnected: ${socket.id}`, this.logname);
        this.redisService.setUserStatus(userId, 'offline');
        this.redisService.deleteUserSocket(userId);
      });

      socket.on('message', () => {
        socket.emit('message', `${socket.id} welcome to overwatch mini world!`);
      });

      // 경기 목록 가져오기
      socket.on('match:list', async (dto: { page: number; limit: number }) => {
        try {
          const { page, limit } = dto;
          const list = await this.gameService.getMatchList(page, limit);
          socket.emit('match:list', list);
        } catch (error) {
          console.log(error);
          socket.emit('error', error);
        }
      });

      // 매칭 및 팀 생성
      socket.on('match:status:create', async (dto: { password?: string }) => {
        try {
          const { error, value } = CreateMatchDto.validate(dto);
          if (error) {
            throw new Error(`${error}: ${value}`);
          }
          const { password } = dto;
          const match = await this.gameService.createMatch(userId, password);
          await this.gameService.participateTeam(socket, userId, match.id);
          await matchStatus(this.io, this.redisService, match.id);
        } catch (error) {
          socket.emit('error', error);
          console.log(error);
        }
      });

      // 매칭 초대시
      socket.on(
        'match:invitation:send',
        async (dto: { matchId: Match['id']; invitee: User['id'] }) => {
          try {
            const result = await this.gameService.invitePlayers({
              inviter: userId,
              ...dto,
            });
            this.io.to(result.invitee).emit('match:invitation:receive', result);
          } catch (error) {
            console.log(error);
            socket.emit('error', error);
          }
        }
      );

      // 매칭 초대 수락시 또는 초대 없이 매칭 참여시
      socket.on(
        'match:participate',
        async (dto: { matchId: Match['id']; password: Match['password'] }) => {
          try {
            const { matchId, password } = dto;
            await this.gameService.participateMatch(
              socket,
              userId,
              matchId,
              password
            );
            await matchStatus(this.io, this.redisService, matchId);
          } catch (error) {
            console.log(error);
            socket.emit('error', error);
          }
        }
      );

      // 경기 시작
      socket.on('match:status:start', async (dto: { matchId: Match['id'] }) => {
        try {
          const { matchId } = dto;
          await this.gameService.gameStart(socket, matchId, userId);
        } catch (error) {
          socket.emit('error', error);
          console.log(error);
        }
      });

      // 경기 정보 가져오기
      socket.on('match:status:get', async (dto: { matchId: Match['id'] }) => {
        try {
          const result = await this.redisService.getMatchStatus(dto.matchId);
          // console.log('match status: ', result);
          socket.emit('match:status:get', result);
        } catch (error) {
          socket.emit('error', error);
          console.log(error);
        }
      });

      // 영웅 선택시
      socket.on(
        'match:hero:choice',
        async (dto: { playerId: Player['id']; heroName: string }) => {
          try {
            console.log(dto);
            const { playerId, heroName } = dto;
            const player = await this.gameService.findPlayer(playerId);
            if (!player) {
              throw new Error('해당 경기의 플레이어가 아닙니다.');
            }
            const match = await this.gameService.findMatch(player.matchId);
            if (!match) {
              throw new Error('해당 경기가 존재하지 않습니다.');
            }
            if (match.status !== MatchStatus.InProgress) {
              console.log(match.status);
              throw new Error('아직 영웅을 선택할 수 없습니다.');
            }
            const hero = await this.gameService.chooseHero(playerId, heroName);
            const matchStatus = await this.redisService.getMatchStatus(
              hero.matchId
            );
            socket.emit('match:hero:choice', hero, matchStatus);
          } catch (error) {
            console.log(error);
            socket.emit('error', error);
          }
        }
      );

      // 경기 종료
      socket.on('match:status:over', async (dto: { matchId: Match['id'] }) => {
        try {
          const { matchId } = dto;
          this.io.in(matchId).disconnectSockets(true);
          await this.gameService.gameOver(matchId);
        } catch (error) {
          socket.emit('error', error);
          console.log(error);
        }
      });
    });
  }
}
