import { Server } from 'socket.io';
import http from 'http';
import { ChatGateway } from '../gateways/chat.gateway';
import { GameGateway } from '../gateways/game.gateway';
import { ModuleInitLog, logger } from '../winston';
import { RedisService } from '../services/redis.service';
import { GameService } from '../services/game.service';
import { AnaGateway } from '../gateways/heroes/support/ana.gateway';
import { CassidyGateway } from '../gateways/heroes/damage/cassidy.gateway';
import { ReinhardtGateway } from '../gateways/heroes/tank/reinhardt.gateway';

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

    // ============= game ==================
    const game = new GameGateway(
      this.io.of('/game'),
      this.redisService,
      this.gameService
    );
    const ana = new AnaGateway(this.io.of('/game'), this.redisService);
    const cassidy = new CassidyGateway(this.io.of('/game'), this.redisService);
    const reinhardt = new ReinhardtGateway(
      this.io.of('/game'),
      this.redisService
    );

    // ============== chat ==================
    const chat = new ChatGateway(this.io.of('/chat'));

    logger.info(ModuleInitLog, {
      filename: 'SocketModule',
    });

    return this.io;
  }
}
