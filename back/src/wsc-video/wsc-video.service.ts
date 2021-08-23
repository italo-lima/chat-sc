import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway(0, { cors: { origin: '*' }, namespace: 'video' })
export class WebsocketServiceVideo
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger: Logger = new Logger('Socket');

  @WebSocketServer()
  private server: Server;

  private users = {};

  afterInit() {
    this.logger.log('Initialized gateway video!');
  }

  handleConnection(client: Socket) {
    this.logger.log(`client connected ${client.id}`);
    client.emit('me', client.id);
    // const { name } = client.handshake.query
    // this.users[client.id] = { name }
  }

  handleDisconnect(client: Socket, ...args: any[]) {
    // const { name, room_id } = this.users[client.id]
    delete this.users[client.id];
    this.logger.log(`client disconnected ${client.id}`);
    // client.broadcast.to(room_id).emit(
    //   'receive-status-user',
    //   { status: `${name} acabou de sair da sala...` })
    client.disconnect(true);
  }

  @SubscribeMessage('join')
  joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { user_id: string; room_id: string },
  ) {
    const { user_id, room_id } = body;
    this.users[client.id] = { user_id, room_id };
    console.log('novo usuário', user_id);
    console.log('sala', room_id);
    client.join(room_id);
    client.broadcast.to(room_id).emit('user-connected', user_id);
  }

  @SubscribeMessage('send-message')
  sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { message: string },
  ) {
    const { name, room_id } = this.users[client.id];
    client.broadcast.to(room_id).emit('receive-message', { ...body, name });
  }

  // @SubscribeMessage('send-status-user')
  // sendStatusUser(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() body: { status: string, room_id: string }
  // ) {
  //   const { status, room_id } = body
  //   client.broadcast.to(room_id).emit('receive-status-user', { status })
  // }
}
