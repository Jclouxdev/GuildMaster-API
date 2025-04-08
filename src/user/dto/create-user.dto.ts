import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsEnum,
  IsNotEmpty,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IUser } from '../interfaces/user.interface';
import { ERegions } from '../../shared/enums/Regions';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto implements IUser {
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  @ApiProperty({
    description: 'Username of the user',
    example: 'adventurer123',
  })
  username: string;

  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  @ApiProperty({
    description: 'Email of the user',
    example: 'user@email.com',
  })
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(50)
  @ApiProperty({
    description: 'Password of the user (will be hashed)',
    example: 'securepassword123',
  })
  password: string;

  @IsEnum(ERegions, { each: true })
  @ArrayNotEmpty()
  @ArrayMaxSize(Object.values(ERegions).length)
  @ApiProperty({
    description: 'Regions of the user',
    example: ['EU', 'US'],
    enum: ERegions,
    isArray: true,
  })
  region: ERegions[];
}
