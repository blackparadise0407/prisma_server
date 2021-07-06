import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as moment from 'moment';
import { ConfirmationService } from 'src/auth/confirmation/confirmation.service';

@Injectable()
export class TaskService {
	private readonly logger = new Logger(TaskService.name);
	constructor(private readonly confirmationService: ConfirmationService) {}

	@Cron('0 0 * * * *')
	async handleRemoveExpiredConfirmation() {
		const currentDate = moment().add(15, 'minutes').toDate();
		await this.confirmationService.deleteMany({
			expiredAt: { $lt: currentDate },
		});
	}
}
