import { HeroName } from '../../../types/hero-name.type';
import { Role } from '../../../types/role.type';
import { Hero } from '../hero';

export class Tank extends Hero {
  constructor(
    public name: HeroName,
    public role: Role,
    public health: number,
    public maxHealth: number,
    public speed: number,
    public ultimate: number,
    public maxUltimate: number,
    public superCharged: boolean,
    public dead: boolean,
    public kill: number,
    public death: number,
    public shield: number,
    public rush: number
  ) {
    super(
      name,
      role,
      health,
      maxHealth,
      speed,
      ultimate,
      maxUltimate,
      superCharged,
      dead,
      kill,
      death
    );
    this.shield = shield;
    this.rush = rush;
  }

  async takeDamage(amount: number) {
    super.takeDamage(amount);
  }

  async takeHeal(amount: number) {
    super.takeHeal(amount);
  }

  async defend(amount: number) {
    this.shield -= amount;
    console.log(
      `${this.name} defends attack ${amount}. durability: ${this.shield}`
    );
  }

  async rushing(target: Hero) {
    target.takeDamage(this.rush);
  }
}
