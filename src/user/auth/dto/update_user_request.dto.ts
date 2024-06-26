
import { IsOptional, IsString, IsEmail, IsBoolean, MinLength } from 'class-validator';

export class UpdateUserRequestDto {

  @IsOptional()
  @IsString({ message: 'Username must be a string value' })
  readonly username?: string;

  @IsOptional()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @IsString({ message: 'Password must be a string value' })
  password?: string;

  @IsOptional()
  @IsEmail()
  readonly email?: string;

  // @IsOptional()
  // @IsBoolean({message: 'Status must be a boolean value'})
  // readonly is_active?: boolean;

  @IsOptional()
  profile_pic?: string;

}
