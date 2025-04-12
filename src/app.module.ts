import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './config/database.module';
import { UserModule } from './user/user.module';
import { GuildModule } from './guild/guild.module';
import { GuildMembershipModule } from './guild-membership/guild-membership.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    UserModule,
    GuildModule,
    GuildMembershipModule,
  ],
})
export class AppModule {}
