import { AppDataSource } from '../data-source';
import { Match } from '../entities/match.entity';
import { Player } from '../entities/player.entity';
import { Team } from '../entities/team.entity';
import { User } from '../entities/user.entity';
import { RedisService } from '../services/redis.service';
import { MatchService } from '../services/match.service';
import { PlayerService } from '../services/player.service';
import { TeamService } from '../services/team.service';
import { UserService } from '../services/user.service';
import { ModuleInitLog, logger } from '../winston';
import { SocketModule } from './socket.module';
import http from 'http';
import express from 'express';
import { UserRoute } from '../routes/user.route';
import { GameService } from '../services/game.service';
import { redisClient } from '../redis/redis.client';

export class AppModule {
  dataSource: any;

  constructor(
    private app: express.Application,
    private readonly httpServer: http.Server
  ) {
    this.initModule();
    logger.info(ModuleInitLog, { filename: 'AppModule' });
  }

  async initModule() {
    const dataSource = AppDataSource;
    const matchRepository = dataSource.getRepository(Match);
    const teamRepository = dataSource.getRepository(Team);
    const playerRepository = dataSource.getRepository(Player);
    const userRepository = dataSource.getRepository(User);

    const matchService = new MatchService(matchRepository);
    const teamService = new TeamService(teamRepository);
    const playerService = new PlayerService(playerRepository);
    const userService = new UserService(userRepository);
    const redisService = new RedisService(redisClient); // 싱글톤 적용

    const gameService = new GameService(
      matchService,
      redisService,
      userService,
      playerService,
      teamService
    );
    const socket = new SocketModule(this.httpServer, redisService, gameService);
    const userRoute = new UserRoute(userService);

    this.app.use('/users', userRoute.init());

    return socket;
  }
}
