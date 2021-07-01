import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: true,
	});

	const logger = new Logger('App', true);

	const globalPrefix = '/api';

	app.use(
		helmet({
			contentSecurityPolicy:
				process.env.NODE_ENV === 'production' ? undefined : false,
		}),
	);
	app.enableCors({
		origin: process.env.CORS_ORIGIN,
	});

	if (AppModule.isDev) {
		const config = new DocumentBuilder()
			.setTitle('Prisma example')
			.setDescription('The Prisma API description')
			.setVersion('1.0')
			.addTag('prisma')
			.setBasePath(globalPrefix)
			.build();

		const document = SwaggerModule.createDocument(app, config);
		SwaggerModule.setup(`${globalPrefix}/docs`, app, document);
	}

	app.setGlobalPrefix(globalPrefix);

	// Validate query params and body
	app.useGlobalPipes(new ValidationPipe({ transform: true }));

	await app.listen(AppModule.port);

	// Log current url of app
	let baseUrl = app.getHttpServer().address().address;
	if (baseUrl === '0.0.0.0' || baseUrl === '::') {
		baseUrl = 'localhost';
	}
	logger.log(`Listening to http://${baseUrl}:${AppModule.port}${globalPrefix}`);
	if (AppModule.isDev) {
		logger.log(
			`Swagger UI: http://${baseUrl}:${AppModule.port}${globalPrefix}/swagger`,
		);
	}
}

bootstrap();
