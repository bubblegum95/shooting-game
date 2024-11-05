import { Namespace } from 'socket.io';
import { Skill } from './skill';
import { RedisService } from '../redis.service';
import { Hero } from '../heroes/hero';
import { resetMatchStatus } from '../heroes/renewMatchStatus';

export class BasicSkill extends Skill {
  constructor(
    public name: string,
    public isActive: boolean,
    public cooltime: number,
    public bullets: number,
    public maxBullets: number,
    public charging: number,
    public power: number,
    public point: number
  ) {
    super(name, isActive);
  }

  async chargeBullets(io: Namespace, redisService: RedisService, player: Hero) {
    this.isActive = false;
    await resetMatchStatus(io, redisService, player);

    setTimeout(async () => {
      this.bullets = this.maxBullets;
      this.isActive = true;
      await resetMatchStatus(io, redisService, player);
    }, this.charging);
  }
}
