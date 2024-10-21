import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1', // Redis 서버 호스트
  port: parseInt(process.env.REDIS_PORT || '6379'), // Redis 서버 포트
  password: process.env.REDIS_PASSWORD || undefined, // Redis 비밀번호 (있는 경우)
});

export default redis;
