import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { EGuildRoles } from '../../shared/enums/Guilds';
import { ApiProperty } from '@nestjs/swagger';
import { ERegions } from '../../shared/enums/Regions';

export class CreateGuildMembershipDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'ID of the guild',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  guildId: string;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'ID of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @IsNotEmpty()
  @IsEnum(EGuildRoles)
  @ApiProperty({
    description: 'Role of the user in the guild',
    example: EGuildRoles.MEMBER,
    enum: EGuildRoles,
  })
  role: EGuildRoles;
}
