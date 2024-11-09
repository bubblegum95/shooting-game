import { Namespace } from 'socket.io';
import { updateSkillStatus } from './updateMatchStatus';
import { RedisService } from '../services/redis.service';
import { Hero } from './hero';
import { Player } from '../entities/player.entity';
import { Match } from '../entities/match.entity';

export class Skill {
  [key: string]: any;

  constructor(
    public whose: Player['id'],
    public matchId: Match['id'],
    public name: string,
    public category: 'primary' | 'secondary' | 'ultimate',
    public type1: 'lethal' | 'non-lethal' | 'mixed',
    public type2: 'mobility' | 'deploy' | 'mounting' | 'throwing',
    public isActive: boolean
  ) {}

  async chargeBullets(io: Namespace, redisService: RedisService) {
    if (this.category === 'primary' && this.bullets) {
      this.bullets = this.maxBullets;
      await updateSkillStatus(io, redisService, this);
    }
  }

  async isNotUsable(io: Namespace, redisService: RedisService) {
    if (this.isActive) {
      this.isActive = false;
      await updateSkillStatus(io, redisService, this);
    }
  }

  async isUsable(io: Namespace, redisService: RedisService) {
    if (!this.isActive) {
      this.isActive = true;
      await updateSkillStatus(io, redisService, this);
    }
  }

  async takeDamage(io: Namespace, redisService: RedisService, damage: number) {
    if (this.durability) {
      this.durability -= damage;
      await updateSkillStatus(io, redisService, this);
    }
  }

  async powerUp(
    io: Namespace,
    redisService: RedisService,
    duration: number,
    increase: number
  ) {
    this.power *= increase;
    await updateSkillStatus(io, redisService, this);

    setTimeout(async () => {
      this.power /= increase;
      await updateSkillStatus(io, redisService, this);
    }, duration);
  }
}
// js에서는 다중 상속 개념이 없음.. "믹스인" 이라는 개념이 있으나 프로토타입에 메서드 할당까지만 가능.
// 따라서 중복되는 클래스 하위 분류 필요함. 어떤 속성을 상속해야 하는지 알 수 있기 때문.
// 1차 분류: 기본기, 특기, 궁극기
// 2차 분류: 살상, 비살상(힐, 탱), 혼합(살상, 비살상)
// 3차 분류: 이동기, 설치기, 장착형
// 클래스의 상속으로 카테고리와 타입을 분류하기 보다는 카테고리 및 타입 자체를 클래스의 속성으로 두는 것이 더 바람직함.
