import { io, Socket } from 'socket.io-client';

export class SocketController {
  public socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000');

    this.socket.on('connect', this.onConnect);
    this.socket.on('disconnect', this.onDisconnect);
    this.socket.on('error', this.onError);
    this.socket.on('message', this.onMessage);
  }

  private onConnect = () => {
    console.log('Connected to server');
  };

  private onDisconnect = () => {
    console.log('Disconnected from server');
  };

  private onError = (msg: string) => {
    console.log(msg);
    process.exit()
  };

  private onMessage = (msg: string) => {
    console.log('Message from server: ' + msg);
  };

  public emit(event: string, data?: any) {
    this.socket.emit(event, data);
  }

  public on(event: string, listener: (...args: any[]) => void) {
    this.socket.on(event, listener);
  }

  public once(event: string, listener: (...args: any[]) => void) {
    this.socket.once(event, listener);
  }

  public off(event: string, listener?: (...args: any[]) => void) {
    this.socket.off(event, listener);
  }
}