import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateGuildMembershipDto } from './create-guild-membership.dto';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { EGuildStatus } from 'src/shared/enums/Guilds';

export class UpdateGuildMembershipDto extends PartialType(CreateGuildMembershipDto) {
  @IsEnum(EGuildStatus)
  @ApiProperty({
    description: 'Status of the guild membership',
    example: EGuildStatus.ACTIVE,
    enum: EGuildStatus,
  })
  status: EGuildStatus;
}
