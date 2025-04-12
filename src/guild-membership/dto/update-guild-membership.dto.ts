import { PartialType } from '@nestjs/swagger';
import { CreateGuildMembershipDto } from './create-guild-membership.dto';

export class UpdateGuildMembershipDto extends PartialType(CreateGuildMembershipDto) {}
