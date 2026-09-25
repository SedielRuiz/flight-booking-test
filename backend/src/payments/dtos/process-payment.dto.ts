import { IsNotEmpty, IsString } from 'class-validator';

export class ProcessPaymentDto {
  @IsString()
  @IsNotEmpty()
  encryptedPayload!: string;

  @IsString()
  @IsNotEmpty()
  flightId!: string;

  @IsString()
  @IsNotEmpty()
  seatId!: string;
}
