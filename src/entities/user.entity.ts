import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false, length: 10 })
  name: string;

  @Column({ type: 'varchar', nullable: false, length: 10 })
  username: string;

  @Column({ type: 'varchar', nullable: false, length: 20, unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: false, length: 100 })
  password: string;

  @Column({ type: 'varchar', nullable: false, length: 11, unique: true })
  phone: string;

  @CreateDateColumn()
  createdAt: Date;
}
