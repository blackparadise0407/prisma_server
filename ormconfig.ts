import { ConnectionOptions } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

const config = {
	host: process.env.DATABASE_HOST,
	port: parseInt(process.env.DATABASE_PORT, 10),
	username: `${process.env.DATABASE_USERNAME}`,
	password: `${process.env.DATABASE_PASSWORD}`,
	database: process.env.DATABASE_NAME,
};

const connectionOptions: ConnectionOptions = {
	type: 'postgres',
	host: config.host,
	port: config.port,
	username: config.username,
	password: config.password,
	database: config.database,
	entities: ['dist/**/*.entity.js'],
	synchronize: false,
	migrations: [getMigrationDirectory()],
	cli: {
		migrationsDir: 'src/migrations',
	},
};

function getMigrationDirectory() {
	const directory =
		process.env.NODE_ENV === 'migration' ? 'src' : `${__dirname}`;
	return `${directory}/migrations/**/*{.ts,.js}`;
}

export default connectionOptions;
