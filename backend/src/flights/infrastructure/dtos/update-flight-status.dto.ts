import { IsEnum, IsNotEmpty } from 'class-validator';
import { FlightStatusEnum } from '@flights/domain/enums/flight-status.enum.js';

export class UpdateFlightStatusDto {
  @IsNotEmpty({ message: 'The status field is required' })
  @IsEnum(FlightStatusEnum, { message: 'Invalid flight status' })
  status: FlightStatusEnum;
}
