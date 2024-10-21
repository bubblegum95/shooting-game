import { HeroName } from '../../type/hero-name.type';
import { Role } from '../../type/role.type';
import { Hero } from '../hero';
import { Damage } from './damage';

export class Parah extends Damage {
  constructor(
    public name: HeroName,
    public role: Role.Damage,
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

  async attack(target: Hero) {
    super.attack(target);
  }

  async takeDamage(amount: number) {
    super.takeDamage(amount);
  }

  async takeHeal(amount: number) {
    super.takeHeal(amount);
  }
}
