
import { IsString, IsOptional, IsEmail } from 'class-validator';

export class UpdateMemberDto {
  @IsString()
  @IsOptional()
  nidn?: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  faculty?: string;
  
  @IsString()
  @IsOptional()
  studyProgram?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;
}
