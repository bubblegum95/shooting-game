import { Namespace } from 'socket.io';
import { Skill } from './skill';
import { RedisService } from '../redis.service';
import { Hero } from '../heroes/hero';
import { resetMatchStatus } from '../heroes/renewMatchStatus';

export class UltimateSkill extends Skill {
  constructor(public name: string, public isActive: boolean) {
    super(name, isActive);
  }

  async isUseable(io: Namespace, redisService: RedisService, player: Hero) {
    this.isActive = true;
    await resetMatchStatus(io, redisService, player);
  }
}
