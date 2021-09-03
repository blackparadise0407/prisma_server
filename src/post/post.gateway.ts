import {
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	ConnectedSocket,
} from '@nestjs/websockets';
import { plainToClass } from 'class-transformer';
import { Server, Socket } from 'socket.io';

import { BaseGateway } from 'src/common/base.gateway';
import { LoggerService } from 'src/logger/logger.service';
import { CommentPostDTO } from 'src/user/dto/user-action.dto';
import {
	UserAction,
	UserActionType,
} from 'src/user/user-action/user-action.entity';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { PostService } from './post.service';

@WebSocketGateway({ namespace: 'post', cors: true })
export class PostGateway extends BaseGateway {
	constructor(
		private readonly postService: PostService,
		private readonly userService: UserService,
	) {
		super();
	}
	handleConnection(client: Socket, ...args: any) {
		this.logger.log(`[Client connected from post]: ${client.id}`);
	}

	@SubscribeMessage('comment')
	async handleReceiveComment(
		client: Socket,
		data: CommentPostDTO & { user: User },
	) {
		const { entityId, type, content, user, replyToId } = data;
		const id = new Date();
		this.wss.emit(`post/${entityId}/comment`, {
			id,
			content,
			entityId,
			type,
			replyToId,
			user,
			status: 'loading',
		});
		const comment = await this.userService.commentEntityById(user.id, data);
		this.wss.emit(`post/${entityId}/comment/success`, {
			postId: entityId,
			id: comment.id,
			tempId: id,
		});
	}
}
