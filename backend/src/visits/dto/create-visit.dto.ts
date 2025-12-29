import { IsString, IsNotEmpty, IsEmail, IsOptional, IsEnum, IsDateString, ValidateNested, ValidateIf, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { VisitStatus, Host } from '../../types';

class VisitorDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  company: string;

  @ValidateIf(o => o.email !== '' && o.email !== null) 
  @IsEmail()
  @IsOptional()
  email?: string;
  
  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  // @IsNotEmpty()
  photoUrl: string;
}

// FIX: Create a HostDto class for validation and transformation, as Host is an interface.
class HostDto implements Host {
  // @IsUUID()
  // @IsNotEmpty()
  // id: string;

  @IsString()      // Gunakan IsString agar validasi tetap berjalan untuk ID format apapun
  @IsNotEmpty()
  id: string;

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

class EventInfoDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  @IsNotEmpty()
  eventName: string;
}

export class CreateVisitDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => VisitorDto)
  visitor: VisitorDto;

  @IsOptional()
  @ValidateNested()
  // FIX: Use HostDto class instead of Host interface for class-transformer.
  @Type(() => HostDto)
  host?: Host;

  @IsString()
  @IsOptional()
  destination?: string;

  @IsString()
  @IsNotEmpty()
  purpose: string;

  @IsEnum(VisitStatus)
  @IsOptional()
  status?: VisitStatus;

  @IsDateString()
  @IsOptional()
  checkInTime?: Date;

  @IsString()
  @IsOptional()
  signatureDataUrl?: string;

  @IsString()
  @IsOptional()
  checkinCode?: string;

  // FIX: Add eventInfo to allow linking visits to events.
  @IsOptional()
  @ValidateNested()
  @Type(() => EventInfoDto)
  eventInfo?: EventInfoDto;
}
