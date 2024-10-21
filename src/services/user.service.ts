import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async findUser(userId: User['id']): Promise<User | null> {
    try {
      return this.userRepository.findOne({ where: { id: userId } });
    } catch (error) {
      throw error;
    }
  }
}
