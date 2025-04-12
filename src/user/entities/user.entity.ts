import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  Index,
  OneToMany,
} from 'typeorm';
import { IsEmail, IsNotEmpty, IsEnum, Length, ArrayNotEmpty } from 'class-validator';
import { IUser } from '../interfaces/user.interface';
import * as bcrypt from 'bcrypt';
import * as process from 'node:process';
import { Exclude } from 'class-transformer';
import { ERegions } from '../../shared/enums/Regions';
import { GuildEntity } from '../../guild/entities/guild.entity';
import { GuildMembershipEntity } from '../../guild-membership/entities/guild-membership.entity';

@Entity('users')
@Index(['email', 'username'])
export class UserEntity implements IUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsNotEmpty()
  @Length(3, 50)
  @Column({ type: 'varchar', length: 50 })
  username: string;

  @ArrayNotEmpty()
  @IsNotEmpty({ each: true })
  @IsEnum(ERegions, { each: true })
  @Column({ type: 'enum', enum: ERegions, array: true })
  region: ERegions[];

  @IsNotEmpty()
  @IsEmail()
  @Column({
    unique: true,
    type: 'varchar',
    length: 255,
  })
  email: string;

  @IsNotEmpty()
  @Exclude({ toPlainOnly: true })
  @Column({ type: 'varchar', length: 255 })
  password: string;

  @IsNotEmpty()
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
    if (this.password) {
      const saltRounds = parseInt(process.env['BCRYPT_SALT_ROUNDS'] || '10');
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  @BeforeUpdate()
  async hashPasswordBeforeUpdate(): Promise<void> {
    const saltRounds = parseInt(process.env['BCRYPT_SALT_ROUNDS'] || '10');
    if (this.password) {
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }
}
