import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async findUser(userId: User['id']): Promise<User | null> {
    try {
      return this.userRepository.findOne({ where: { id: userId } });
    } catch (error) {
      throw error;
    }
  }

  async findbyEmail(email: string) {
    return await this.userRepository.findOne({ where: { email } });
  }

  async create(dto: {
    name: string;
    username: string;
    email: string;
    password: string;
    phone: string;
  }) {
    const user = await this.userRepository.save({ ...dto });
    return user;
  }

  async signUp(dto: {
    name: string;
    username: string;
    email: string;
    password: string;
    phone: string;
  }) {
    try {
      const { name, username, email, password, phone } = dto;
      const existEmail = await this.findbyEmail(email);
      if (existEmail) {
        throw new Error('해당 이메일로 가입된 계정이 있습니다.');
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await this.create({
        name,
        username,
        email,
        password: hashedPassword,
        phone,
      });

      return true;
    } catch (error) {
      throw error;
    }
  }

  async signToken(payload: { id: string }, expiresIn?: string) {
    try {
      const secretKey = process.env.JWT_SECRET_KEY;
      if (!secretKey) {
        throw new Error('토큰에 서명을 할 수 없습니다.');
      }
      if (expiresIn) {
        return jwt.sign(payload, secretKey, { expiresIn });
      } else {
        return jwt.sign(payload, secretKey);
      }
    } catch (error) {
      throw error;
    }
  }

  async signIn(dto: { email: string; password: string }) {
    try {
      const { email, password } = dto;
      const foundEmail = await this.findbyEmail(email);
      if (!foundEmail) {
        throw new Error('해당 이메일로 가입된 사용자가 없습니다.');
      }
      const hashedPassword = foundEmail.password;
      const isCorrect = bcrypt.compare(password, hashedPassword);
      if (!isCorrect) {
        throw new Error('비밀번호가 일치하지 않습니다.');
      }
      const payload = { id: foundEmail.id };
      const token = await this.signToken(payload);

      return { token, userId: foundEmail.id };
    } catch (error) {
      throw error;
    }
  }
}
