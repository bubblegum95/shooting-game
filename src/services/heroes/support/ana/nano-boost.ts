import { Hero } from '../../hero';

export class NanoBoost {
  duration: number;
  increase: number;
  isActive: boolean;

  constructor(duration: number, increase: number, isActive: boolean) {
    this.increase = increase;
    this.duration = duration;
    this.isActive = isActive;
  }

  async useTo(target: Hero, coolTime: number) {
    console.log(`the power of ${target.name} increases.`);
    this.isActive = false;
    target.power = target.power * this.increase;

    setTimeout(() => {
      target.power = target.power / this.increase;
    }, this.duration);

    setTimeout(() => {
      this.isActive = true;
    }, coolTime);
  }
}
