import { Cassidy } from '../../../heroes/damage/cassidy/cassidy.hero';
import { Deadeye } from '../../../heroes/damage/cassidy/deadeye.skill';
import { Flashbang } from '../../../heroes/damage/cassidy/flashbang.skill';
import { Peacekeeper } from '../../../heroes/damage/cassidy/peacekeeper.skill';
import { Rampage } from '../../../heroes/damage/cassidy/rampage.skill';

export const cassidy = function (
  matchId: string,
  teamId: string,
  playerId: string
) {
  const peacekeeper = new Peacekeeper(
    playerId,
    teamId,
    matchId,
    'peacekeeper',
    'primary',
    'lethal',
    'mounting',
    true,
    8000,
    6,
    6,
    60,
    10,
    3000
  );
  const rampage = new Rampage(
    playerId,
    teamId,
    matchId,
    'rampage',
    'secondary',
    'lethal',
    'mounting',
    true,
    5000,
    100,
    50,
    30
  );
  const flashbang = new Flashbang(
    playerId,
    teamId,
    matchId,
    'flashbang',
    'secondary',
    'lethal',
    'throwing',
    true,
    3000,
    10000,
    40,
    40
  );
  const deadeye = new Deadeye(
    playerId,
    teamId,
    matchId,
    'deadeye',
    'ultimate',
    'lethal',
    'mounting',
    false,
    false,
    10000,
    300
  );
  return new Cassidy(
    'Cassidy',
    'Damage',
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
};
