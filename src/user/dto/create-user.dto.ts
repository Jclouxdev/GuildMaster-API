import { IsEnum, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { IUser } from '../interfaces/user.interface';

export class CreateUserDto implements IUser {
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  @IsEnum(['EU', 'NA', 'ASIA'])
  region: 'EU' | 'NA' | 'ASIA';
}
