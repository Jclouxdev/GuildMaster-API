import { Module } from '@nestjs/common';
import { GuildMembershipService } from './guild-membership.service';
import { GuildMembershipController } from './guild-membership.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuildEntity } from '../guild/entities/guild.entity';
import { GuildMembershipEntity } from './entities/guild-membership.entity';
import { UserModule } from '../user/user.module';
import { GuildModule } from '../guild/guild.module';

@Module({
  imports: [TypeOrmModule.forFeature([GuildMembershipEntity]), UserModule, GuildModule],
  controllers: [GuildMembershipController],
  providers: [GuildMembershipService],
  exports: [GuildMembershipService, TypeOrmModule],
})
export class GuildMembershipModule {}
