import { Namespace } from 'socket.io';
import { RedisService } from '../redis.service';
import { Hero } from '../heroes/hero';
import { resetMatchStatus } from '../heroes/renewMatchStatus';
import { Skill } from './skill';

export class LethalSkill extends Skill {
  [key: string]: any;
  constructor(
    public name: string,
    public isActive: boolean,
    public cooltime: number,
    public power: number,
    public point: number
  ) {
    super(name, isActive);
  }

  async chargeBullets(io: Namespace, redisService: RedisService, player: Hero) {
    super.chargeBullets(io, redisService, player);
  }

  async powerUp(
    io: Namespace,
    redisService: RedisService,
    player: Hero,
    increase: number,
    duration: number
  ) {
    if (this.power && typeof this.power === 'number') {
      this.power *= increase;
      await resetMatchStatus(io, redisService, player);

      setTimeout(async () => {
        this.power /= increase;
        await resetMatchStatus(io, redisService, player);
      }, duration);
    }
  }
}