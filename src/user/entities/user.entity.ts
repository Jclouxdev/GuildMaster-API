import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, Index } from 'typeorm';
import { IsEmail, IsNotEmpty, IsEnum, Length } from 'class-validator';
import { IUser } from '../interfaces/user.interface';
import * as bcrypt from 'bcrypt';
import * as process from 'node:process';
import { Exclude } from 'class-transformer';

@Entity('users')
@Index(['email', 'username'])
export class UserEntity implements IUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsNotEmpty()
  @Length(3, 50)
  @Column({ type: 'varchar', length: 50 })
  username: string;

  @IsNotEmpty()
  @IsEnum(['EU', 'NA', 'ASIA'])
  @Column({ type: 'enum', enum: ['EU', 'NA', 'ASIA'] })
  region: 'EU' | 'NA' | 'ASIA';

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
