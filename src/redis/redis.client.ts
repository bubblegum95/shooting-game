import dotenv from 'dotenv/config';
import { Cluster, ClusterOptions } from 'ioredis';

// Redis 클러스터 노드 설정
export const redisCluster = new Cluster(
  [
    { host: '127.0.0.1', port: 6371 },
    { host: '127.0.0.1', port: 6372 },
    { host: '127.0.0.1', port: 6373 },
    { host: '127.0.0.1', port: 6374 },
    { host: '127.0.0.1', port: 6375 },
    { host: '127.0.0.1', port: 6376 },
  ],
  {
    redisOptions: {
      password: process.env.REDIS_PASSWORD,
    },
  }
);

redisCluster.on('connect', () => {
  console.log('Redis 클러스터에 연결되었습니다.');
});

// 에러 핸들링
redisCluster.on('error', (err) => {
  console.error('Redis 클러스터 연결 오류:', err);
});
