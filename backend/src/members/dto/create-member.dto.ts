
import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class CreateMemberDto {
  @IsString()
  @IsNotEmpty()
  nidn: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  faculty: string;

  @IsString()
  @IsNotEmpty()
  studyProgram: string;

  @IsString()
  @IsNotEmpty()
  position: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;
}
