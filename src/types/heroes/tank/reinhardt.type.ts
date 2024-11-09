import { BarrierField } from '../../../heroes/tank/reinhardt/barrier-field.skill';
import { Charge } from '../../../heroes/tank/reinhardt/charge.skill';
import { Earthshatter } from '../../../heroes/tank/reinhardt/earthshatter.skill';
import { FireStrike } from '../../../heroes/tank/reinhardt/fire-strike.skill';
import { Reinhardt } from '../../../heroes/tank/reinhardt/reinhardt.hero';
import { RocketHammer } from '../../../heroes/tank/reinhardt/rocket-hammer.skill';

export const reinhardt = function (
  matchId: string,
  teamId: string,
  playerId: string
) {
  const rocketHammer = new RocketHammer(
    playerId,
    teamId,
    matchId,
    'rocketHammer',
    'primary',
    'lethal',
    'mounting',
    true,
    50,
    15,
    360,
    30,
    800
  );
  const fireStrike = new FireStrike(
    playerId,
    teamId,
    matchId,
    'fireStrike',
    'secondary',
    'lethal',
    'mounting',
    true,
    8000,
    60,
    40
  );
  const charge = new Charge(
    playerId,
    teamId,
    matchId,
    'charge',
    'secondary',
    'lethal',
    'mobility',
    true,
    false,
    5000,
    300,
    40,
    3
  );
  const barrierField = new BarrierField(
    playerId,
    teamId,
    matchId,
    'barrierField',
    'secondary',
    'non-lethal',
    'mounting',
    true,
    1500,
    1500,
    5000,
    false
  );
  const earthshatter = new Earthshatter(
    playerId,
    teamId,
    matchId,
    'earthshatter',
    'ultimate',
    'lethal',
    'mounting',
    false,
    30,
    2000
  );
  return new Reinhardt(
    'Reinhardt',
    'Tank',
    1300,
    1300,
    15,
    0,
    1000,
    true,
    0,
    0,
    matchId,
    teamId,
    playerId,
    { rocketHammer, fireStrike, charge, barrierField, earthshatter }
  );
};
