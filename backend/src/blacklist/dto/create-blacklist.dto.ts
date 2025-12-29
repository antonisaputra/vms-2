import { IsString, IsNotEmpty } from 'class-validator';

export class CreateBlacklistDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}