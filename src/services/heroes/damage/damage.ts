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
    public speed: number,
    public ultimate: number,
    public maxUltimate: number,
    public isAlive: boolean,
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
      speed,
      ultimate,
      maxUltimate,
      isAlive,
      kill,
      death,
      matchId,
      teamId,
      playerId
    );
  }
}
