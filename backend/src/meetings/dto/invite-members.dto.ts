
import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class InviteMembersDto {
  @IsArray()
  @IsNotEmpty()
  @IsUUID('4', { each: true, message: 'Each memberId must be a valid UUID' })
  memberIds: string[];
}
