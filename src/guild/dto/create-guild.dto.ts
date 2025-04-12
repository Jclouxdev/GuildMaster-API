import { ERegions } from '../../shared/enums/Regions';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
} from 'class-validator';
import { MAXIMUM_GUILD_MEMBERS_POSSIBLE } from '../../shared/constants/Guild';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../user/entities/user.entity';
import { IGuild } from '../interfaces/guild.interface';

export class CreateGuildDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Name of the guild',
    example: 'Horizons End',
  })
  @Length(3, 50)
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Description of the guild',
    example: 'A guild for adventurers seeking new horizons.',
  })
  @Length(3, 255)
  description: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'ID of the owner of the guild',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  ownerId: string;

  @IsOptional()
  @ApiProperty({
    description: 'ID of the creator of the guild',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  creatorId?: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Region of the guild',
    example: 'EU',
    enum: ERegions,
  })
  @IsEnum(ERegions)
  region: ERegions;

  @IsNotEmpty()
  @IsNumber()
  @Max(MAXIMUM_GUILD_MEMBERS_POSSIBLE)
  @ApiProperty({
    description: 'Maximum number of members allowed in the guild',
    example: 200,
  })
  maximumMembersAllowed: number;

  @IsOptional()
  @ApiProperty({
    description: 'Tags associated with the guild',
    example: '["adventure", "exploration"]',
  })
  @IsString({ each: true })
  tags?: string[];
}
