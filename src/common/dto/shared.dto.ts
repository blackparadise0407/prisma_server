import { ApiProperty } from '@nestjs/swagger';

export class GeneralQueryDTO {
	@ApiProperty()
	readonly page: number;

	@ApiProperty()
	readonly limit: number;

	@ApiProperty()
	readonly keyword: string;
}
