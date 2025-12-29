import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterForEventDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  company?: string;
}