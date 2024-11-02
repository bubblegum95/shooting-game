import { Namespace } from 'socket.io';
import { RedisService } from '../redis.service';
import { Hero } from '../heroes/hero';
import { resetMatchStatus } from '../heroes/renewMatchStatus';

export class Skill {
  [key: string]: any;
  constructor(public name: string, public isActive: boolean) {}

  async chargeBullets(io: Namespace, redisService: RedisService, player: Hero) {
    this.isActive = false;
    await resetMatchStatus(io, redisService, player);

    setTimeout(async () => {
      this.bullets = this.maxBullets;
      this.isActive = true;
      await resetMatchStatus(io, redisService, player);
    }, this.chargingTime);
  }
}
