import { IsString, IsEmail, MinLength, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;
  
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;
  
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
