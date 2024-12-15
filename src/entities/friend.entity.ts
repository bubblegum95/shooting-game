import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'friend' })
export class Friend {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  user1: User['id'];

  @Column()
  user2: User['id'];
}
