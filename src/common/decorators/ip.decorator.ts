import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Ip = createParamDecorator((_data, ctx: ExecutionContext) => {
	const req = ctx.switchToHttp().getRequest();
	return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
});
