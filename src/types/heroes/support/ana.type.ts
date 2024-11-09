import { Ana } from '../../../heroes/support/ana/ana.hero';
import { BioticGrenade } from '../../../heroes/support/ana/biotic-grenade.skill';
import { BioticRifle } from '../../../heroes/support/ana/biotic-rifle.skill';
import { NanoBoost } from '../../../heroes/support/ana/nano-boost.skill';
import { Scope } from '../../../heroes/support/ana/scope.skill';
import { SleepDart } from '../../../heroes/support/ana/sleep-dart.skill';

export const ana = function (
  matchId: string,
  teamId: string,
  playerId: string
) {
  const bioticGrenade = new BioticGrenade(
    'bioticGrenade',
    playerId,
    matchId,
    'secondary',
    'mixed',
    'throwing',
    true,
    1.5,
    20,
    3000,
    12
  );

  const scope = new Scope(
    'scope',
    playerId,
    matchId,
    'secondary',
    'mixed',
    'mounting',
    true
  );

  const sleepDart = new SleepDart(
    'sleepDart',
    playerId,
    matchId,
    'secondary',
    'lethal',
    'mounting',
    true,
    10000,
    3000,
    20,
    30
  );

  const nanoBoost = new NanoBoost(
    'nanoBoost',
    playerId,
    matchId,
    'ultimate',
    'non-lethal',
    'mounting',
    false,
    5000,
    1.5
  );

  const bioticRifle = new BioticRifle(
    'bioticRifle',
    playerId,
    matchId,
    'primary',
    'mixed',
    'mounting',
    true,
    1000 * 1.6, // 스킬 쿨타임
    30, // power
    10, // point
    12,
    12,
    1000 * 1.7 // 탄창 장전 타임
  );

  return new Ana(
    'Ana',
    'Support',
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
    { bioticRifle, scope, bioticGrenade, sleepDart, nanoBoost }
  );
};
