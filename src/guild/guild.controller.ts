import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GuildService } from './guild.service';
import { CreateGuildDto } from './dto/create-guild.dto';
import { UpdateGuildDto } from './dto/update-guild.dto';
import { GuildEntity } from './entities/guild.entity';
import { ERegions } from '../shared/enums/Regions';

@Controller('guild')
export class GuildController {
  constructor(private readonly guildService: GuildService) {}

  @Post()
  async create(@Body() createGuildDto: CreateGuildDto): Promise<GuildEntity> {
    return await this.guildService.create(createGuildDto);
  }

  @Get()
  findAll() {
    return this.guildService.findAll();
  }

  @Get(':id')
  findOneById(@Param('id') id: string) {
    return this.guildService.findOneById(id);
  }

  @Get('name/:name')
  findByName(@Param('name') name: string) {
    return this.guildService.findByName(name);
  }

  @Get('region/:region')
  findByRegion(@Param('region') region: ERegions) {
    return this.guildService.findByRegion(region);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateGuildDto: UpdateGuildDto) {
  //   return this.guildService.update(+id, updateGuildDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.guildService.remove(id);
  }
}
