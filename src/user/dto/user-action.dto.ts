import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { EntityType } from 'src/common/enums';
import { EnumToArray } from 'src/utils/enum-to-array';
import { ReactionType } from '../user-action/user-action.entity';

export class ReactPostDTO {
	@IsNotEmpty({ message: 'Entity type is required' })
	@ApiProperty({ enum: [...EnumToArray(EntityType)] })
	readonly entityType: EntityType;

	@IsNotEmpty({ message: 'Entity id is required' })
	@ApiProperty()
	readonly entityId: number;

	@IsNotEmpty({ message: 'Reaction type is required' })
	@ApiProperty({ enum: [...EnumToArray(ReactionType)] })
	readonly reactionType: ReactionType;
}
