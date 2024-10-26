import { Match } from '../../../entities/match.entity';
import { Player } from '../../../entities/player.entity';
import { Team } from '../../../entities/team.entity';
import { HeroName } from '../../../types/hero-name.type';
import { Role } from '../../../types/role.type';
import { Hero } from '../hero';

export class Damage extends Hero {
  constructor(
    public name: HeroName,
    public role: Role,
    public health: number,
    public maxHealth: number,
    public power: number,
    public speed: number,
    public ultimate: number,
    public maxUltimate: number,
    public dead: boolean,
    public kill: number,
    public death: number,
    public matchId: Match['id'],
    public teamId: Team['id'],
    public playerId: Player['id']
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
      dead,
      kill,
      death,
      matchId,
      teamId,
      playerId
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
