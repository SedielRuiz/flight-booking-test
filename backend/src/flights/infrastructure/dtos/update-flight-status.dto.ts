import { IsEnum, IsNotEmpty } from 'class-validator';
import { FlightStatusEnum, SeatStatusEnum } from '@domain/index.js';

export class UpdateFlightStatusDto {
  @IsNotEmpty({ message: 'The status field is required' })
  @IsEnum(FlightStatusEnum, { message: 'Invalid flight status' })
  status: FlightStatusEnum;
}
