import { Match } from '../entities/match.entity';
import { Player } from '../entities/player.entity';
import { Team } from '../entities/team.entity';
import { Cassidy } from '../services/heroes/damage/cassidy/cassidy';
import { Ana } from '../services/heroes/support/ana/ana';
import { HeroName } from './hero-name.type';
import {
  bioticGrenade,
  bioticRifle,
  nanoBoost,
  sleepDart,
} from './heroes/ana.type';
import {
  deadeye,
  flashbang,
  peacekeeper,
  rampage,
} from './heroes/cassidy.type';
import { Role } from './role.type';

export const Heroes = function (
  type: string,
  matchId: Match['id'],
  teamId: Team['id'],
  playerId: Player['id']
) {
  switch (type) {
    case 'Ana':
      return new Ana(
        HeroName.Ana,
        Role.Support,
        200, // health
        200, // maxHealth
        15, // speed
        0, // ultimate
        1000, // maxUltimate
        true, // isAlive
        0, // kill
        0, // death
        matchId,
        teamId,
        playerId,
        { bioticRifle, bioticGrenade, sleepDart, nanoBoost }
      );
    case 'Cassidy':
      return new Cassidy(
        HeroName.Cassidy,
        Role.Damage,
        250,
        250,
        15,
        0,
        1000,
        true,
        0,
        0,
        matchId,
        teamId,
        playerId,
        { peacekeeper, rampage, flashbang, deadeye }
      );

    default:
      throw new Error();
  }
};
