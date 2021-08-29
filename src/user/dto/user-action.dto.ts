import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { EntityType } from 'src/common/enums';
import { EnumToArray } from 'src/utils/enum-to-array';
import {
	ReactionType,
	UserActionType,
} from '../user-action/user-action.entity';

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

export class CommentPostDTO {
	@IsNotEmpty({ message: 'Entity type is required' })
	@ApiProperty({ enum: [...EnumToArray(EntityType)] })
	readonly entityType: EntityType;

	@IsNotEmpty({ message: 'Entity id is required' })
	@ApiProperty()
	readonly entityId: number;

	@IsNotEmpty({ message: 'Type is required' })
	@ApiProperty({ enum: [...EnumToArray(UserActionType)] })
	readonly type: UserActionType.COMMENT;

	@IsNotEmpty({ message: 'Content is required' })
	@ApiProperty()
	readonly content: string;

	@ApiProperty()
	readonly replyToId: number;
}
