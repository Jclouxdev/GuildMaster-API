import { IGuildMembership } from '../interfaces/guild-membership.interface';
import { UserEntity } from '../../user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GuildEntity } from '../../guild/entities/guild.entity';
import { EGuildRoles, EGuildStatus } from '../../shared/enums/Guilds';
import { IsNotEmpty } from 'class-validator';

@Entity('guild_membership')
export class GuildMembershipEntity implements IGuildMembership {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, user => user.guildMemberships)
  @JoinColumn()
  @IsNotEmpty()
  user: UserEntity;

  @ManyToOne(() => GuildEntity, guild => guild.memberships)
  @JoinColumn()
  @IsNotEmpty()
  guild: GuildEntity;

  @Column({ type: 'enum', enum: EGuildRoles, default: EGuildRoles.APPLICANT })
  @IsNotEmpty()
  role: EGuildRoles;

  @Column({ type: 'enum', enum: EGuildStatus, default: EGuildStatus.PENDING })
  @IsNotEmpty()
  status: EGuildStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  applicationDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  joinDate: Date;
}
