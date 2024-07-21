
import { IsOptional, IsString, IsUUID, IsNotEmpty } from 'class-validator';

export class UpdateGroupRequestDTO {

  @IsUUID()
  @IsString()
  @IsNotEmpty()
  readonly unique_id: string;

  @IsOptional()
  @IsString({ message: 'Name must be a string value' })
  @IsNotEmpty()
  readonly name?: string;
  
  @IsOptional()
  @IsString({ message: 'Description must be a string value' })
  readonly description?: string;

  @IsOptional()
  group_pic?: string;

}
