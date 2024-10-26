import { Server } from 'socket.io';
import http from 'http';
import { ChatGateway } from '../gateways/chat.gateway';
import { GameGateway } from '../gateways/game.gateway';
import { ModuleInitLog, logger } from '../winston';
import { AnaGateWay } from '../gateways/ana.gateway';
import { RedisService } from '../services/redis.service';
import { MatchService } from '../services/match.service';
import { TeamService } from '../services/team.service';
import { PlayerService } from '../services/player.service';
import { UserService } from '../services/user.service';

export class SocketModule {
  private io: Server | undefined;

  constructor(
    private server: http.Server,
    private matchService: MatchService,
    private teamService: TeamService,
    private playerService: PlayerService,
    private userService: UserService,
    private redisService: RedisService
  ) {
    this.init(this.server);
  }

  init(server: http.Server): Server {
    this.io = new Server(server, {
      cors: {
        origin: '*',
      },
    });

    const game = new GameGateway(
      this.io.of('/game'),
      this.matchService,
      this.teamService,
      this.playerService,
      this.userService,
      this.redisService
    );
    const ana = new AnaGateWay(this.io.of('/game'), this.redisService);

    // ============== chat ==================
    const chat = new ChatGateway(this.io.of('/chat'));

    logger.info(ModuleInitLog, {
      filename: 'SocketModule',
    });

    return this.io;
  }
}
