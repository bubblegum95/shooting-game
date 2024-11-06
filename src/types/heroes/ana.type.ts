import { BioticGrenade } from '../../services/heroes/support/ana/biotic-grenade';
import { BioticRifle } from '../../services/heroes/support/ana/biotic-rifle';
import { NanoBoost } from '../../services/heroes/support/ana/nano-boost';
import { SleepDart } from '../../services/heroes/support/ana/sleep-dart';

export const bioticGrenade = new BioticGrenade(
  'bioticGrenade',
  'secondary',
  'mixed',
  false,
  true,
  1.5,
  20,
  3000,
  12
);
export const sleepDart = new SleepDart(
  'sleepDart',
  'secondary',
  'lethal',
  false,
  true,
  10000,
  3000,
  20,
  30
);
export const nanoBoost = new NanoBoost(
  'nanoBoost',
  'ultimate',
  'non-lethal',
  false,
  false,
  5000,
  1.5
);
export const bioticRifle = new BioticRifle(
  'bioticRifle',
  'primary',
  'mixed',
  false,
  true,
  1000 * 1.6, // 스킬 쿨타임
  30,
  10,
  false,
  12,
  12,
  1000 * 1.7 // 탄창 장전 타임
);
