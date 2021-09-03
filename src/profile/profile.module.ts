import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './profile.entity';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
	imports: [TypeOrmModule.forFeature([Profile]), LoggerModule],
	controllers: [ProfileController],
	providers: [ProfileService],
	exports: [ProfileService],
})
export class ProfileModule {}
