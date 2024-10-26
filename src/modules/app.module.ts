import { AppDataSource } from '../data-source';
import { Match } from '../entities/match.entity';
import { Player } from '../entities/player.entity';
import { Team } from '../entities/team.entity';
import { User } from '../entities/user.entity';
import redis from '../redis/redis';
import { RedisService } from '../services/redis.service';
import { MatchService } from '../services/match.service';
import { PlayerService } from '../services/player.service';
import { TeamService } from '../services/team.service';
import { UserService } from '../services/user.service';
import { ModuleInitLog, logger } from '../winston';
import { SocketModule } from './socket.module';
import http from 'http';
import express from 'express';
import userRouter from '../routes/user.route';

export class AppModule {
  dataSource: any;

  constructor(
    private app: express.Application,
    private readonly httpServer: http.Server
  ) {
    this.initModule();
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
    const redisService = new RedisService(redis);

    const socket = new SocketModule(
      this.httpServer,
      matchService,
      teamService,
      playerService,
      userService,
      redisService
    );

    this.app.use('/users', userRouter);

    logger.info(ModuleInitLog, { filename: 'AppModule' });

    return socket;
  }
}
