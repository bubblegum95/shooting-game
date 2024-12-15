import dotenv from 'dotenv/config';
import { Cluster } from 'ioredis';

// Redis 클러스터 노드 설정
export const redisCluster = new Cluster(
  [
    {
      host: process.env.REDIS_NODE_HOST_0,
      port: Number(process.env.REDIS_NODE_PORT_0),
    },
    {
      host: process.env.REDIS_NODE_HOST_1,
      port: Number(process.env.REDIS_NODE_PORT_1),
    },
    {
      host: process.env.REDIS_NODE_HOST_2,
      port: Number(process.env.REDIS_NODE_PORT_2),
    },
    {
      host: process.env.REDIS_NODE_HOST_3,
      port: Number(process.env.REDIS_NODE_PORT_3),
    },
    {
      host: process.env.REDIS_NODE_HOST_4,
      port: Number(process.env.REDIS_NODE_PORT_4),
    },
    {
      host: process.env.REDIS_NODE_HOST_5,
      port: Number(process.env.REDIS_NODE_PORT_5),
    },
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
  console.log('cluster host 0: ', process.env.REDIS_NODE_HOST_0);
});
