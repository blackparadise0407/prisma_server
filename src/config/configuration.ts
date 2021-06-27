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
		accessToken: {
			ttl: parseInt(process.env.ACCESS_TOKEN_TTL, 10) || 60 * 5, // 15 mins
			secret: process.env.ACCESS_TOKEN_SECRET,
		},
		refreshToken: {
			ttl: parseInt(process.env.REFRESH_TOKEN_TTL, 10) || 60 * 60 * 30, // 30 days
			secret: process.env.REFRESH_TOKEN_SECRET,
		},
	},
});
