export interface JwtPayload {
	sub: string | number;
	iat?: number;
	exp?: number;
}
