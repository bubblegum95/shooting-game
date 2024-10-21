import { Parah } from '../services/heroes/damage/parah';
import { Ana } from '../services/heroes/support/ana/ana';
import { HeroName } from './hero-name.type';
import { Role } from './role.type';

export let Heroes = {
  Ana: new Ana(
    HeroName.Ana,
    Role.Support,
    200,
    200,
    33,
    15,
    0,
    1000,
    false,
    false,
    0,
    0,
    33
  ),
  Parah: new Parah(
    HeroName.Parah,
    Role.Damage,
    250,
    250,
    45,
    15,
    0,
    1000,
    false,
    false,
    0,
    0
  ),
};
