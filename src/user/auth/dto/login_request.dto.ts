import { IsNotEmpty, IsString } from "class-validator";


export class LoginRequestDto {
  @IsString({message: 'Username must be a string type'})
  @IsNotEmpty({message: 'Username must not be empty'})
  readonly username: string;

  @IsString({message: 'Password must be a string type'})
  @IsNotEmpty({message: 'Password must not be empty'})
  readonly password: string;
}