import { HeroName } from '../../type/hero-name.type';
import { Role } from '../../type/role.type';
import { Hero } from '../hero';

export class Support extends Hero {
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
    public death: number,
    public heal: number
  ) {
    super(
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
  }

  async attacks(target: Hero) {
    super.attacks(target);
  }

  async healsAlly(target: Hero, point: number) {
    target.takesHeal(this.heal);
    if (this.ultimate < 100) {
      this.ultimate += point;
    }
  }

  async takesDamage(amount: number) {
    super.takesDamage(amount);
  }

  async takesHeal(amount: number) {
    super.takesHeal(amount);
  }

  async usesUltimate() {
    super.usesUltimate();
  }
}
