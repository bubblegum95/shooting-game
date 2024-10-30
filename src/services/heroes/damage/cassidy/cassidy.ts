import { Match } from '../../../../entities/match.entity';
import { Player } from '../../../../entities/player.entity';
import { Team } from '../../../../entities/team.entity';
import { HeroName } from '../../../../types/hero-name.type';
import { Role } from '../../../../types/role.type';
import { ModuleInitLog, logger } from '../../../../winston';
import { Damage } from '../damage';

export class Cassidy extends Damage {
  constructor(
    public name: HeroName,
    public role: Role.Damage,
    public health: number,
    public maxHealth: number,
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

    logger.info(ModuleInitLog, { filename: 'Cassidy' });
  }
}
