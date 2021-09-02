import {
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { BaseGateway } from 'src/common/base.gateway';
import { LoggerService } from 'src/logger/logger.service';

@WebSocketGateway({ namespace: 'post', cors: true })
export class PostGateway extends BaseGateway {
	handleConnection(client: Socket, ...args: any) {
		this.logger.log(`[Client connected from post]: ${client.id}`);
	}

	@SubscribeMessage('comment')
	handleReceiveComment(client: Socket, data: any) {
		const { entityId, entityType, content, user, replyToId } = data;
		client.broadcast.emit(`post/${entityId}/comment`, {
			content,
			entityId,
		});
	}
}
