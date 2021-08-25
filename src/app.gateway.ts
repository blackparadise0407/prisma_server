import { WebSocketGateway } from '@nestjs/websockets';
import { BaseGateway } from './common/base.gateway';

@WebSocketGateway({ namespace: 'app', cors: true })
export class AppGateway extends BaseGateway {}
