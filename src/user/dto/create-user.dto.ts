import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { IUser } from '../interfaces/user.interface';
import { ApiProperty } from '@nestjs/swagger';
import { EGuildRoles } from '../../shared/enums/Guilds';

export class CreateUserDto implements Omit<IUser, 'id' | 'guildRole' | 'emailVerified' | 'createdAt' | 'updatedAt'> {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: 'Email of the user',
    example: 'user@email.com',
  })
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character'
  })
  @ApiProperty({
    description: 'Password of the user (min 8 chars, 1 uppercase, 1 number, 1 special)',
    example: 'SecurePass123!',
  })
  password: string;

  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-zA-Z\s\-]+$/, {
    message: 'First name can only contain letters, spaces and hyphens'
  })
  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
  })
  firstName: string;

  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-zA-Z\s\-]+$/, {
    message: 'Last name can only contain letters, spaces and hyphens'
  })
  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
  })
  lastName: string;

  // passwordHash sera généré automatiquement par l'entité
  passwordHash?: string;
}
