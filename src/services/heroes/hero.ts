import { HeroName } from '../type/hero-name.type';
import { Role } from '../type/role.type';

export class Hero {
  [key: string]: any; // 인덱스 시그니처로 동적 속성 허용

  constructor(
    public name: HeroName,
    public role: Role,
    public health: number,
    public maxHealth: number,
    public power: number,
    public speed: number,
    public ultimate: number,
    public maxUltimate: number,
    public superCharged: boolean,
    public dead: boolean,
    public kill: number,
    public death: number
  ) {}

  // 일반 공격
  async attacks(target: Hero) {
    console.log(
      `${this.name} attacks ${target.name} with ${this.power} power!`
    );
    target.takesDamage(this.power);
  }

  // 데미지
  async takesDamage(amount: number) {
    this.health -= amount;
    console.log(
      `${this.name} took ${amount} damage. Health is now ${this.health}.`
    );
  }

  // 힐
  async takesHeal(amount: number) {
    this.health += amount;
    console.log(
      `${this.name} took ${amount} heal. Health is now ${this.health}.`
    );
  }

  // 궁극기 스킬 사용
  async usesUltimate() {
    this.ultimate = 0;
    console.log(`${this.name} use now ultimate skill`);
  }

  // 사망
  async dies(hero: Hero): Promise<Hero> {
    try {
      hero.dead = false;
      const {
        name,
        role,
        health,
        maxHealth,
        power,
        speed,
        ultimate,
        maxUltimate,
        superCharged,
        dead,
        kill,
        death,
      } = hero;
      const newHero = new Hero(
        name,
        role,
        health,
        maxHealth,
        power,
        speed,
        ultimate,
        maxUltimate,
        superCharged,
        dead,
        kill,
        death
      );

      return newHero;
    } catch (error) {
      throw error;
    }
  }

  async respawns(hero: Hero, duration: number) {
    try {
      if (hero.dead === true) {
        return setTimeout(this.die, duration, hero);
      }
    } catch (error) {
      throw error;
    }
  }
}
