import { IGuild } from '../interfaces/guild.interface';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IsEnum, IsNotEmpty, IsOptional, Length, Max } from 'class-validator';
import { UserEntity } from '../../user/entities/user.entity';
import { ERegions } from '../../shared/enums/Regions';
import { MAXIMUM_GUILD_MEMBERS_POSSIBLE } from '../../shared/constants/Guild';

@Entity('guild')
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

  // TODO: Fix joint because no FK currently
  @IsNotEmpty()
  @OneToOne(() => UserEntity)
  @JoinColumn()
  owner: UserEntity;

  // TODO: Fix joint because no FK currently
  @IsOptional()
  @OneToOne(() => UserEntity)
  @JoinColumn()
  creator: UserEntity;

  @IsNotEmpty()
  @IsEnum(ERegions)
  @Column({ type: 'enum', enum: ERegions })
  region: ERegions;

  @IsNotEmpty()
  @Column({ type: 'int' })
  @Max(MAXIMUM_GUILD_MEMBERS_POSSIBLE)
  maximumMembersAllowed: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: Date;

  @Column({ type: 'varchar', array: true, nullable: true })
  tags?: string[];
}
