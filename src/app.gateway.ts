import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { BaseGateway } from './common/base.gateway';

@WebSocketGateway({ namespace: 'app', cors: true })
export class AppGateway extends BaseGateway {
	@SubscribeMessage('ping')
	handleJoinRoom() {
		this.logger.log('Pong');
		this.wss.emit('alo', 'Hello there');
	}
}
