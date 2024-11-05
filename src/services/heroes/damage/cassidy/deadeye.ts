import { Namespace } from 'socket.io';
import { RedisService } from '../../../redis.service';
import { Hero } from '../../hero';
import { resetMatchStatus } from '../../renewMatchStatus';
import { Cassidy } from './cassidy';
import { UltimateSkill } from '../../../skill/ultimate.skill';

export class Deadeye extends UltimateSkill {
  constructor(
    public name: string,
    public isActive: boolean,
    public casting: boolean,
    public duration: number,
    public power: number,
    public point: number
  ) {
    super(name, isActive);
  }

  async isUseable(io: Namespace, redisService: RedisService, player: Hero) {
    super.isUseable(io, redisService, player);
  }

  async use(io: Namespace, redisService: RedisService, player: Cassidy) {
    this.isActive = false;
    this.casting = true;
    await resetMatchStatus(io, redisService, player);

    setTimeout(() => {
      this.casting = false;
    }, this.duration);
    await resetMatchStatus(io, redisService, player);
  }

  async to(
    io: Namespace,
    redisService: RedisService,
    player: Hero,
    targets?: Hero[]
  ) {
    if (this.casting && targets) {
      for (const target of targets) {
        target.takeDamage(io, redisService, this.power);
        await resetMatchStatus(io, redisService, target);
      }

      await resetMatchStatus(io, redisService, player);
    }
  }
}
