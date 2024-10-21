import { Hero } from '../../hero';

export class SleepDart {
  duration: number;
  isActive: boolean;

  constructor(duration: number, isActive: boolean) {
    this.duration = duration;
    this.isActive = isActive;
  }

  async useTo(target: Hero, coolTime: number) {
    console.log(`${target.name} is hit by Sleep Dart and falls asleep.`);
    target.sleep(this.duration);
    this.isActive = false;
    setTimeout(() => {
      this.isActive = true;
    }, coolTime);
  }
}

Hero.prototype.sleep = function (duration: number) {
  this.isAsleep = true;
  console.log(`${this.name} is now asleep.`);
  setTimeout(() => {
    this.isAsleep = false;
    console.log(`${this.name} woke up.`);
  }, duration);
};
