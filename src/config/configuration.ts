export default () => ({
	port: parseInt(process.env.PORT, 10) || 3000,
	database: {
		uri: process.env.DATABASE_URI,
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
		image: {
			limit: 1024 * 1024, // 1MB
			mime: ['image/jpeg', 'image/png', 'image/webp'],
		},
		video: {
			limit: 1024 * 1024 * 100, // 100MB
			mime: ['video/x-msvideo', 'video/mp4', 'video/mpeg', 'video/webm'],
		},
	},
});
