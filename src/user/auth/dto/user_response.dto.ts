import { Exclude } from "class-transformer";

export class UserResponseDto {
  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }

  id: number;
  unique_id: string;
  username: string;
  @Exclude()
  password: string;
  @Exclude()
  refresh_token: string | null;
  email: string;
  reset_token: string | null;
  reset_token_expiry: Date | null;
  is_active: boolean
  created_at: Date
  @Exclude()
  created_by: string | null
  updated_at: Date
  @Exclude()
  updated_by: string | null
}
