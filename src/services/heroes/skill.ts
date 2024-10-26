export class Skill {
  [key: string]: any;
  constructor(
    public name: string,
    public isActive: boolean,
    public duration?: number,
    public cooltime?: number
  ) {}
}
