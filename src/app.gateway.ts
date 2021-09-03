import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { BaseGateway } from './common/base.gateway';

@WebSocketGateway({ namespace: 'app', cors: true })
export class AppGateway extends BaseGateway {
	handleConnection(client: Socket) {
		this.logger.log(`[Abstract method]: ${client.id}`);
	}

	@SubscribeMessage('ping')
	handleJoinRoom() {
		this.logger.log('Pong');
		this.wss.emit('alo', 'Hello there');
	}
}
