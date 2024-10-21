import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Team } from './team.entity';
import { MatchStatus } from '../types/match-status.type';

@Entity({ name: 'match' })
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  ownerId: string;

  @Column({ type: 'varchar', nullable: false })
  type: keyof typeof BattleField;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    nullable: false,
    default: MatchStatus.Ready,
  })
  status: MatchStatus;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Team, (team) => team.match)
  teams: Team[];
}
