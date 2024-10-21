import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { ModuleInitLog, logger } from './winston';
import { Player } from './entities/player.entity';
import { Match } from './entities/match.entity';
import { Team } from './entities/team.entity';
import 'dotenv/config';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Player, Match, Team],
  synchronize: true,
});

// DataSource 초기화
AppDataSource.initialize()
  .then(() => {
    logger.info(ModuleInitLog, {
      filename: 'DataSource',
    });
  })
  .catch((error) => {
    logger.error('Error during Data Source initialization');
    console.error(error);
  });
