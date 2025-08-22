import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: 'Email of the user',
    example: 'user@email.com',
  })
  email: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Password of the user',
    example: 'SecurePass123!',
  })
  password: string;
}
