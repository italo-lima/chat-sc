import { Module } from '@nestjs/common';
import { WebsocketServiceChat } from './wsc-chat/wsc-chat.service';
import { WebsocketServiceVideo } from './wsc-video/wsc-video.service';

@Module({
  imports: [],
  controllers: [],
  providers: [WebsocketServiceChat, WebsocketServiceVideo],
})
export class AppModule {}
