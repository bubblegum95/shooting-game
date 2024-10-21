import { createLogger, format, transports } from 'winston';

// 사용자 정의 포맷
const customFormat = format.printf(
  ({ timestamp, level, message, filename }) => {
    return `${timestamp} [${level}]:[${filename}] ${message}`;
  }
);

// Logger 생성
export const logger = createLogger({
  level: 'info', // 기본 로그 레벨
  format: format.combine(
    format.timestamp(), // 타임스탬프 추가
    format.colorize({ colors: { info: 'blue', error: 'red' } }),
    customFormat
  ),
  transports: [
    new transports.Console(), // 콘솔에 로그 출력
    new transports.File({ filename: 'error.log', level: 'error' }), // 오류 로그는 파일에 저장
    new transports.File({ filename: 'combined.log' }), // 모든 로그를 파일에 저장
  ],
});

export const ModuleInitLog = 'has bean initialized successfully';
