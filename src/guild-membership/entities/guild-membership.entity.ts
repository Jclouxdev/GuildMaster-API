import { IGuildMembership } from '../interfaces/guild-membership.interface';
import { UserEntity } from '../../user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { GuildEntity } from '../../guild/entities/guild.entity';
import { EGuildRoles, EGuildStatus } from '../../shared/enums/Guilds';
import { IsNotEmpty } from 'class-validator';

@Entity('guild_memberships')
@Index(['user', 'guild'], { unique: true }) // Empêche les doublons
@Index(['user', 'status'], { 
  unique: true, 
  where: "status = 'ACTIVE'" // Un seul membership actif par utilisateur
})
export class GuildMembershipEntity implements IGuildMembership {
  @PrimaryGeneratedColumn('uuid') // Changé en UUID pour cohérence
  id: string;

  @ManyToOne(() => UserEntity, user => user.guildMemberships)
  @JoinColumn()
  @IsNotEmpty()
  user: UserEntity;

  @ManyToOne(() => GuildEntity, guild => guild.memberships)
  @JoinColumn()
  @IsNotEmpty()
  guild: GuildEntity;

  @Column({ type: 'enum', enum: EGuildRoles, default: EGuildRoles.MEMBER })
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
