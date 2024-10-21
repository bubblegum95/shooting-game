import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Team } from './team.entity';
import { Match } from './match.entity';
import { User } from './user.entity';

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

  @OneToOne(() => User, (user) => user.player)
  @JoinColumn({ name: 'userId' })
  user: User;
}
