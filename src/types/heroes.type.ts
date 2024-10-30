import { Match } from '../entities/match.entity';
import { Player } from '../entities/player.entity';
import { Team } from '../entities/team.entity';
import { Ana } from '../services/heroes/support/ana/ana';
import { BioticGrenade } from '../services/heroes/support/ana/biotic-grenade';
import { BioticRifle } from '../services/heroes/support/ana/biotic-rifle';
import { NanoBoost } from '../services/heroes/support/ana/nano-boost';
import { SleepDart } from '../services/heroes/support/ana/sleep-dart';
import { HeroName } from './hero-name.type';
import { Role } from './role.type';

// Support : Ana
const bioticGrenade = new BioticGrenade('bioticGrenade', true, 1.5, 3, 12); // 스킬들은 redis에 어떻게 저장할 것인가?
const sleepDart = new SleepDart('sleepDart', true, 10, 3, 20);
const nanoBoost = new NanoBoost('nanoBoost', false, 5, 1.5);
const bioticRifle = new BioticRifle(
  'bioticRifle',
  true,
  1000 * 1.6, // 스킬 쿨타임
  30,
  false,
  12,
  12,
  1000 * 1.7 // 탄창 장전 타임
);

export const Heroes = function (
  type: HeroName,
  matchId: Match['id'],
  teamId: Team['id'],
  playerId: Player['id']
) {
  switch (type) {
    case HeroName.Ana:
      return new Ana(
        HeroName.Ana,
        Role.Support,
        200,
        200,
        15,
        0,
        1000,
        false,
        0,
        0,
        33,
        matchId,
        teamId,
        playerId,
        bioticGrenade,
        nanoBoost,
        sleepDart,
        bioticRifle
      );

    default:
      throw new Error();
  }
};
