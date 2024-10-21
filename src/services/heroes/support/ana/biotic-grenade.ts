import { Hero } from '../../hero';

export class BioticGrenade {
  increase: number;
  isActive: boolean;

  constructor(increase: number, isActive: boolean) {
    this.increase = increase;
    this.isActive = isActive;
  }

  async useTo(target: Hero, coolTime: number) {
    this.isActive = false;
    target.health += this.increase;
    setTimeout(() => {
      this.isActive = true;
    }, coolTime);
  }
}
