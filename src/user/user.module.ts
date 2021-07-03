import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { AuthModule } from 'src/auth/auth.module';
import { ConfirmationService } from 'src/auth/confirmation/confirmation.service';
import { TokenService } from 'src/auth/token/token.service';
import { LoggerModule } from 'src/logger/logger.module';
import { LoggerService } from 'src/logger/logger.service';
import { MailModule } from 'src/mail/mail.module';
import { MailService } from 'src/mail/mail.service';
import { UserController } from './user.controller';
import { UserResolver } from './user.resolver';
import { User, UserDocument, UserSchema } from './user.schema';
import { UserService } from './user.service';
@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			{
				imports: [ConfigModule],
				inject: [ConfigService],
				name: User.name,
				useFactory: async (configService: ConfigService) => {
					const schema = UserSchema;
					schema.pre('save', function (next: any) {
						const user = this as UserDocument;
						if (!user.isModified('password')) return next();
						const salt: number = parseInt(
							configService.get<string>('crypto.saltRound'),
							10,
						);
						bcrypt.genSalt(salt, function (err, salt) {
							if (err) return next(err);
							bcrypt.hash(user.password, salt, function (err, hash) {
								if (err) return next(err);
								user.password = hash;
								next();
							});
						});
					});

					schema.methods.comparePassword = async function (
						comparedString: string,
					): Promise<boolean> {
						const user = this as UserDocument;
						return await bcrypt.compare(comparedString, user.password);
					};

					schema.virtual('fullName').get(function () {
						return `${this.firstName} ${this.lastName}`;
					});

					schema.set('toJSON', {
						transform: (_user: UserDocument, ret: { [key: string]: any }) => {
							ret.id = ret._id;
							delete ret.password;
							delete ret._id;
							for (const v in ret) {
								if (!ret[v]) delete ret[v];
							}
						},
					});
					return schema;
				},
			},
		]),
		LoggerModule,
		MailModule,
		ConfigModule,
		forwardRef(() => AuthModule),
	],
	providers: [
		UserResolver,
		UserService,
		LoggerService,
		MailService,
		ConfigService,
	],
	exports: [UserService],
	controllers: [UserController],
})
export class UserModule {}
