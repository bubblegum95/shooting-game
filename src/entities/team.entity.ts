import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Match } from './match.entity';
import { Player } from './player.entity';

@Entity({ name: 'team' })
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  matchId: string;

  @Column({ type: 'int', default: 0, nullable: false })
  wins: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Match, (match) => match.teams)
  @JoinColumn({ name: 'matchId' })
  match: Match;

  @OneToMany(() => Player, (player) => player.team)
  players: Player[];
}
