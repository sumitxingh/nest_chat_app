import { IsEmail, IsString } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  newPassword: string;

  @IsString()
  resetToken: string;
}