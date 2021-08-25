import { WebSocketGateway } from '@nestjs/websockets';
import { BaseGateway } from 'src/common/base.gateway';

@WebSocketGateway({ namespace: 'post', cors: true })
export class PostGateway extends BaseGateway {}
