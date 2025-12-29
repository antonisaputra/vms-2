import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class CreateActivityLogDto {
  @IsEnum(['checkin', 'checkout', 'preregister'])
  @IsNotEmpty()
  type: 'checkin' | 'checkout' | 'preregister';

  @IsString()
  @IsNotEmpty()
  text: string;
}