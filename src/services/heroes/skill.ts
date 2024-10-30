import { Namespace } from 'socket.io';
import { RedisService } from '../redis.service';
import { Hero } from '../heroes/hero';
import { renewMatchStatus } from '../heroes/renewMatchStatus';

export class Skill {
  [key: string]: any;
  constructor(
    public name: string,
    public isActive: boolean,
    public bullets?: number,
    public maxBullets?: number,
    public chargingTime?: number,
    public duration?: number,
    public cooltime?: number,
    public power?: number
  ) {}

  async chargeBullets(io: Namespace, redisService: RedisService, player: Hero) {
    this.isActive = false;
    await renewMatchStatus(io, redisService, player);

    setTimeout(async () => {
      this.bullets = this.maxBullets;
      this.isActive = true;
      await renewMatchStatus(io, redisService, player);
    }, this.chargingTime);
  }
}
