import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { GuildMembershipService } from './guild-membership.service';
import { CreateGuildMembershipDto } from './dto/create-guild-membership.dto';
import { UpdateGuildMembershipDto } from './dto/update-guild-membership.dto';

@Controller('guild-membership')
@UseInterceptors(ClassSerializerInterceptor)
export class GuildMembershipController {
  constructor(private readonly guildMembershipService: GuildMembershipService) {}

  @Post()
  create(@Body() createGuildMembershipDto: CreateGuildMembershipDto) {
    return this.guildMembershipService.create(createGuildMembershipDto);
  }

  @Get()
  findAll() {
    return this.guildMembershipService.findAll();
  }

  @Get('guild/:guildId')
  findAllByGuild(@Param('guildId') guildId: string) {
    return this.guildMembershipService.findAllByGuild(guildId);
  }

  @Get('user/:userId')
  findAllByUser(@Param('userId') userId: string, @Body() requestUserId: string) {
    return this.guildMembershipService.findAllByUser(userId, requestUserId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGuildMembershipDto: UpdateGuildMembershipDto) {
    return this.guildMembershipService.update(+id, updateGuildMembershipDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.guildMembershipService.remove(+id);
  }
}
