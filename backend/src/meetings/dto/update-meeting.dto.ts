
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateMeetingDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsDateString()
  @IsOptional()
  date?: Date;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  minutes?: string;
}
