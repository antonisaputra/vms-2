import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { VisitStatus } from '../../types';

export class UpdateVisitDto {
  @IsEnum(VisitStatus)
  @IsOptional()
  status?: VisitStatus;

  @IsDateString()
  @IsOptional()
  checkOutTime?: Date;
}