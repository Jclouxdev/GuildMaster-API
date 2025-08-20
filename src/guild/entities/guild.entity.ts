import { IGuild } from '../interfaces/guild.interface';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IsEnum, IsNotEmpty, IsOptional, Length, Max } from 'class-validator';
import { UserEntity } from '../../user/entities/user.entity';
import { ERegions } from '../../shared/enums/Regions';
import { MAXIMUM_GUILD_MEMBERS_POSSIBLE } from '../../shared/constants/Guild';
import { GuildMembershipEntity } from '../../guild-membership/entities/guild-membership.entity';

@Entity('guilds')
export class GuildEntity implements IGuild {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsNotEmpty()
  @Length(3, 50)
  @Column({ type: 'varchar', length: 50 })
  name: string;

  @IsNotEmpty()
  @Length(3, 255)
  @Column({ type: 'varchar', length: 255 })
  description: string;

  @IsNotEmpty()
  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn()
  owner: UserEntity;

  @IsOptional()
  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn()
  creator: UserEntity;

  @IsNotEmpty()
  @IsEnum(ERegions)
  @Column({ type: 'enum', enum: ERegions })
  region: ERegions;

  @OneToMany(() => GuildMembershipEntity, guildMembership => guildMembership.guild)
  memberships: GuildMembershipEntity[];

  @IsNotEmpty()
  @Column({ type: 'int' })
  @Max(MAXIMUM_GUILD_MEMBERS_POSSIBLE)
  maximumMembersAllowed: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({ type: 'varchar', array: true, nullable: true })
  tags?: string[];

  isFull(): boolean {
    return this.memberships?.length >= this.maximumMembersAllowed;
  }
}
