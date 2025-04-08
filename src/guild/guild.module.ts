import { Module } from '@nestjs/common';
import { GuildService } from './guild.service';
import { GuildController } from './guild.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuildEntity } from './entities/guild.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([GuildEntity]), UserModule],
  controllers: [GuildController],
  providers: [GuildService],
  exports: [GuildService, TypeOrmModule],
})
export class GuildModule {}
