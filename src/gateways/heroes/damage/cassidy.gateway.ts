import { Namespace } from 'socket.io';
import { RedisService } from '../../../services/redis.service';
import { Cassidy } from '../../../services/heroes/damage/cassidy/cassidy';
import { Hero } from '../../../services/heroes/hero';
import { ModuleInitLog, logger } from '../../../winston';

export class CassidyGateway {
  constructor(
    private readonly io: Namespace,
    private readonly redisService: RedisService
  ) {
    this.init();
    logger.info(ModuleInitLog, { filename: 'CassidyGateway' });
  }

  init() {
    this.io.on('connection', (socket) => {
      socket.on('cassidy:get', ({ cassidy }) => {
        console.log(cassidy);
      });

      socket.on('cassidy:peacekeeper:use', async ({ cassidy }) => {
        await this.usePeacekeeper(cassidy);
      });

      socket.on('cassidy:peacekeeper:shot', async ({ cassidy, target }) => {
        await this.usePeacekeeperTo(cassidy, target);
      });

      socket.on('cassidy:rampage:use', async ({ cassidy }) => {
        await this.useRampage(cassidy);
      });

      socket.on('cassidy:rampage:to', async ({ cassidy, target }) => {
        await this.useRampageTo(cassidy, target);
      });

      socket.on('cassidy:flashbang:use', async ({ cassidy }) => {
        await this.useFlashbang(cassidy);
      });

      socket.on('cassidy:flashbang:to', async ({ cassidy, target }) => {
        await this.useFlashbangTo(cassidy, target);
      });

      socket.on('cassidy:deadeye:use', async ({ cassidy }) => {
        await this.useDeadeye(cassidy);
      });

      socket.on('cassidy:deadeye:to', async ({ cassidy, targets }) => {
        await this.useDeadeyeTo(cassidy, targets);
      });
    });
  }

  async chargeBullets(cassidy: Cassidy) {
    await cassidy.chargeBullets(this.io, this.redisService);
  }

  async usePeacekeeper(cassidy: Cassidy) {
    await cassidy.shot(this.io, this.redisService);
  }

  async usePeacekeeperTo(cassidy: Cassidy, target: Hero) {
    await cassidy.heat(this.io, this.redisService, target);
  }

  async useRampage(cassidy: Cassidy) {
    await cassidy.useRampage(this.io, this.redisService);
  }

  async useRampageTo(cassidy: Cassidy, target: Hero) {
    await cassidy.useRampageTo(this.io, this.redisService, target);
  }

  async useFlashbang(cassidy: Cassidy) {
    await cassidy.useRampage(this.io, this.redisService);
  }

  async useFlashbangTo(cassidy: Cassidy, target: Hero) {
    await cassidy.useFlashbangTo(this.io, this.redisService, target);
  }

  async useDeadeye(cassidy: Cassidy) {
    await cassidy.useDeadeye(this.io, this.redisService);
  }

  async useDeadeyeTo(cassidy: Cassidy, targets: Hero[]) {
    await cassidy.useDeadeyeTo(this.io, this.redisService, targets);
  }
}
