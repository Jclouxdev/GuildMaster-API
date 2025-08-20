import { UserEntity } from '../../user/entities/user.entity';
import { GuildEntity } from '../../guild/entities/guild.entity';
import { EGuildRoles, EGuildStatus } from '../../shared/enums/Guilds';

export interface IGuildMembership {
  id?: string;
  user: UserEntity;
  guild: GuildEntity;
  role: EGuildRoles;
  status: EGuildStatus;
  applicationDate: Date;
  joinDate: Date;
}
