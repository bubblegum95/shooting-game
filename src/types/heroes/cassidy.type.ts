import { Deadeye } from '../../services/heroes/damage/cassidy/deadeye';
import { Flashbang } from '../../services/heroes/damage/cassidy/flashbang';
import { Peacekeeper } from '../../services/heroes/damage/cassidy/peacekeeper';
import { Rampage } from '../../services/heroes/damage/cassidy/rampage';

export const peacekeeper = new Peacekeeper(
  'peacekeeper',
  'primary',
  'lethal',
  false,
  true,
  8000,
  6,
  6,
  60,
  10,
  3000
);
export const rampage = new Rampage(
  'rampage',
  'secondary',
  'lethal',
  false,
  true,
  5000,
  100,
  50,
  30
);
export const flashbang = new Flashbang(
  'flashbang',
  'secondary',
  'lethal',
  false,
  true,
  3000,
  10000,
  40,
  40
);
export const deadeye = new Deadeye(
  'deadeye',
  'ultimate',
  'lethal',
  false,
  false,
  false,
  10000,
  300,
  100
);
