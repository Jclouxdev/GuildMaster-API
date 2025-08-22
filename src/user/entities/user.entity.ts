import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  Index,
  OneToMany,
} from 'typeorm';
import { IsEmail, IsNotEmpty, IsEnum, Length } from 'class-validator';
import { IUser } from '../interfaces/user.interface';
import * as bcrypt from 'bcrypt';
import * as process from 'node:process';
import { Exclude } from 'class-transformer';
import { EGuildRoles } from '../../shared/enums/Guilds';
import { GuildEntity } from '../../guild/entities/guild.entity';
import { GuildMembershipEntity } from '../../guild-membership/entities/guild-membership.entity';

@Entity('users')
@Index(['email'])
export class UserEntity implements IUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsNotEmpty()
  @IsEmail()
  @Column({
    unique: true,
    type: 'varchar',
    length: 255,
  })
  email: string;

  @IsNotEmpty()
  @Length(2, 50)
  @Column({ type: 'varchar', length: 50 })
  firstName: string;

  @IsNotEmpty()
  @Length(2, 50)
  @Column({ type: 'varchar', length: 50 })
  lastName: string;

  @IsEnum(EGuildRoles)
  @Column({ 
    type: 'enum', 
    enum: EGuildRoles,
    default: EGuildRoles.MEMBER
  })
  guildRole: EGuildRoles;

  @IsNotEmpty()
  @Exclude({ toPlainOnly: true })
  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @IsNotEmpty()
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @OneToMany(() => GuildEntity, guild => guild.owner)
  createdGuilds: GuildEntity[];

  @OneToMany(() => GuildMembershipEntity, guildMembership => guildMembership.user)
  guildMemberships: GuildMembershipEntity[];

  @BeforeInsert()
  async hashPasswordBeforeInsert(): Promise<void> {
    if (this.passwordHash) {
      const saltRounds = parseInt(process.env['BCRYPT_SALT_ROUNDS'] || '10');
      this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds);
    }
  }

  @BeforeUpdate()
  async hashPasswordBeforeUpdate(): Promise<void> {
    const saltRounds = parseInt(process.env['BCRYPT_SALT_ROUNDS'] || '10');
    if (this.passwordHash) {
      this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds);
    }
  }
}
