import { Namespace } from 'socket.io';

export class ChatGateway {
  constructor(private io: Namespace) {
    this.setupListeners();
  }

  private setupListeners() {
    // 소켓 연결 리스너
    this.io?.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // 클라이언트 연결 종료 리스너
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }
}
