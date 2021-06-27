import { NestFactory } from '@nestjs/core';
import * as helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: true,
	});
	app.use(
		helmet({
			contentSecurityPolicy:
				process.env.NODE_ENV === 'production' ? undefined : false,
		}),
	);
	app.enableCors({
		origin: process.env.CORS_ORIGIN,
	});
	await app.listen(process.env.PORT);
}

bootstrap();
