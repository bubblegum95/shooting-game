import { Server } from 'socket.io';
import http from 'http';
import { ChatGateway } from '../gateways/chat.gateway';
import { GameGateway } from '../gateways/game.gateway';
import { ModuleInitLog, logger } from '../winston';
import { RedisService } from '../services/redis.service';
import { GameService } from '../services/game.service';
import { AnaGateWay } from '../gateways/heroes/support/ana.gateway';

export class SocketModule {
  private io: Server | undefined;

  constructor(
    private server: http.Server,
    private redisService: RedisService,
    private gameService: GameService
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
      this.redisService,
      this.gameService
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
