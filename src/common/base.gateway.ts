import { Logger } from '@nestjs/common';
import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export abstract class BaseGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	protected logger: Logger = new Logger('AppGateway');
	@WebSocketServer() protected readonly wss: Server;

	afterInit(server: Server) {
		this.logger.log('[Connection initialized] .....');
	}

	handleConnection(client: Socket, ...args: any[]) {
		this.logger.log(`[Client connected]: ${client.id}`);
	}

	handleDisconnect(client: Socket) {
		this.logger.log(`[Client disconnected]: ${client.id}`);
	}
}
