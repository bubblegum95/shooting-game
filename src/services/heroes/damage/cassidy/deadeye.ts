import { Namespace } from 'socket.io';
import { LethalSkill } from '../../lethal-skill';
import { RedisService } from '../../../redis.service';
import { Hero } from '../../hero';
import { resetMatchStatus } from '../../renewMatchStatus';

export class Deadeye extends LethalSkill {
  constructor(
    public name: string,
    public isActive: boolean,
    public duration: number,
    public power: number
  ) {
    super(name, isActive, duration);
  }

  async isUseable(io: Namespace, redisService: RedisService, player: Hero) {
    this.isActive = true;
    await resetMatchStatus(io, redisService, player);
  }

  async use(
    io: Namespace,
    redisService: RedisService,
    player: Hero,
    targets: Hero[]
  ) {
    this.isActive = false;
    await resetMatchStatus(io, redisService, player);

    if (targets) {
      for (const target of targets) {
        target.takeDamage(io, redisService, this.power);
      }
    }
  }
}
