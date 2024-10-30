import { Namespace } from 'socket.io';
import { RedisService } from '../redis.service';
import { Hero } from './hero';
import { renewMatchStatus } from './renewMatchStatus';
import { Skill } from './skill';

export class LethalSkill extends Skill {
  [key: string]: any;
  constructor(
    public name: string,
    public isActive: boolean,
    public power: number,
    public bullets?: number,
    public maxBullets?: number,
    public chargingTime?: number,
    public duration?: number,
    public cooltime?: number
  ) {
    super(
      name,
      isActive,
      power,
      bullets,
      maxBullets,
      chargingTime,
      duration,
      cooltime
    );
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
      await renewMatchStatus(io, redisService, player);

      setTimeout(async () => {
        this.power /= increase;
        await renewMatchStatus(io, redisService, player);
      }, duration);
    }
  }
}
