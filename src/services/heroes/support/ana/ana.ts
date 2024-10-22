import { HeroName } from '../../../../types/hero-name.type';
import { Role } from '../../../../types/role.type';
import { Hero } from '../../hero';
import { Support } from '../support';
import { BioticGrenade } from './biotic-grenade';
import { NanoBoost } from './nano-boost';
import { SleepDart } from './sleep-dart';

export class Ana extends Support {
  constructor(
    public name: HeroName,
    public role: Role.Support,
    public health: number,
    public maxHealth: number,
    public power: number,
    public speed: number,
    public ultimate: number,
    public maxUltimate: number,
    public superCharged: boolean,
    public dead: boolean,
    public kill: number,
    public death: number,
    public heal: number
  ) {
    super(
      name,
      role,
      health,
      maxHealth,
      power,
      speed,
      ultimate,
      maxUltimate,
      superCharged,
      dead,
      kill,
      death,
      heal
    );
  }

  async attacksEnamy(target: Hero) {
    super.attacks(target);
  }

  async healsAlly(target: Hero, point: number) {
    super.healsAlly(target, point);
  }

  async takesDamage(amount: number) {
    super.takesDamage(amount);
  }

  async takesHeal(amount: number) {
    super.takesHeal(amount);
  }

  async usesBioticGrenade(
    target: Hero,
    increase: number,
    isActive: boolean, // 스킬 활성화
    coolTime: number // 스킬 쿨타임
  ) {
    const bioticGrenade = new BioticGrenade(increase, isActive);
    bioticGrenade.useTo(target, coolTime);
  }

  async usesSleepDart(
    target: Hero,
    duration: number, // 스킬 지속시간
    isActive: boolean, // 스킬 활성화
    coolTime: number // 스킬 쿨타임
  ) {
    const sleepDart = new SleepDart(duration, isActive);
    await sleepDart.useTo(target, coolTime);
  }

  async usesNanoBoost(
    target: Hero,
    duration: number, // 스킬 지속시간
    increase: number, // 공격력 강화량
    isActive: boolean, // 스킬 활성화
    coolTime: number // 스킬 쿨타임
  ) {
    const nanoBoost = new NanoBoost(duration, increase, isActive);
    nanoBoost.useTo(target, coolTime);
  }
}
