import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Socket, Server } from "socket.io"

@WebSocketGateway(0, { cors: { origin: '*' }, namespace: 'room' })
export class WebsocketServiceChat implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private logger: Logger = new Logger("Socket")

  @WebSocketServer()
  private server: Server

  private users = {}

  afterInit(server: Server) {
    this.logger.log("Initialized gateway!")
  }

  handleConnection(client: Socket) {
    // this.logger.log(`client connected ${client.id}`)
    // const { name } = client.handshake.query
    // this.users[client.id] = { name }
  }

  handleDisconnect(client: Socket, ...args: any[]) {
    const { name, room_id } = this.users[client.id]
    delete this.users[client.id]
    this.logger.log(`client disconnected ${client.id}`)
    client.broadcast.to(room_id).emit(
      'receive-status-user',
      { status: `${name} acabou de sair da sala...` })
    client.disconnect(true)
  }

  @SubscribeMessage('join')
  joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { name: string, room_id: string }
  ) {
    const { name, room_id } = body
    this.users[client.id] = { name, room_id }
    client.join(room_id)
  }

  @SubscribeMessage('send-status-user')
  sendStatusUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { status: string, room_id: string }
  ) {
    const { status, room_id } = body
    client.broadcast.to(room_id).emit('receive-status-user', { status })
  }

  @SubscribeMessage('send-message')
  sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { message: string }
  ) {
    const { name, room_id } = this.users[client.id]
    client.broadcast.to(room_id).emit('receive-message', { ...body, name })
  }
}
