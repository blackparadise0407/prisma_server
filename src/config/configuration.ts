export default () => ({
	port: parseInt(process.env.PORT, 10) || 3000,
	database: {
		host: process.env.DATABASE_HOST,
		port: parseInt(process.env.DATABASE_PORT, 10),
		name: process.env.DATABASE_NAME,
		username: process.env.DATABASE_USERNAME,
		password: process.env.DATABASE_PASSWORD,
	},
	cors: {
		origin: process.env.CORS_ORIGIN || '*',
	},
	crypto: {
		saltRound: 10,
	},
	jwt: {
		access: {
			ttl: parseInt(process.env.ACCESS_TOKEN_TTL, 10) || 60 * 5, // 5 mins
			secret: process.env.ACCESS_TOKEN_SECRET || 'access',
			algorithm: 'HS256',
		},
		refresh: {
			ttl: parseInt(process.env.REFRESH_TOKEN_TTL, 10) || 60 * 60 * 30, // 30 days
		},
	},
	gmail: {
		username: process.env.GMAIL_USERNAME,
		password: process.env.GMAIL_PASSWORD,
	},
	confirmation: {
		ttl: 60 * 15, // 15 mins
	},
	reset_password: {
		ttl: 60 * 15,
	},
	host: process.env.HOST,
	client: process.env.CLIENT,
	redis: {
		defaultTtl: 60 * 15, //15 mins
		host: process.env.REDIS_HOST,
		port: parseInt(process.env.REDIS_PORT, 10),
	},
	queue: {
		mail: 'mailQueue',
		upload: 'uploadQueue',
	},
	multer: {
		servePath: 'public',
	},
	cloudinary: {
		name: process.env.CLOUDINARY_NAME,
		key: process.env.CLOUDINARY_KEY,
		secret: process.env.CLOUDINARY_SECRET,
	},
});
