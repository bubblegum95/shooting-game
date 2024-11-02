import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Team } from './team.entity';

@Entity()
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  teamId: string;

  @Column()
  matchId: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Team, (team) => team.players)
  @JoinColumn({ name: 'teamId' })
  team: Team;
}
