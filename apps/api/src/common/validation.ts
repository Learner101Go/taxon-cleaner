import { IsLatitude, IsLongitude } from 'class-validator';

export class CoordinateValidation {
  @IsLatitude()
  decimalLatitude: number;

  @IsLongitude()
  decimalLongitude: number;
}
