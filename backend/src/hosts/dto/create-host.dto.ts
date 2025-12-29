import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class CreateHostDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  department: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}