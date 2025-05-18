// src/utils/validation/validators.ts
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidCoordinates', async: false })
export class IsValidCoordinatesConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    if (typeof value !== 'number') return false;
    const field = args.property;

    if (field === 'decimalLatitude') {
      return Math.abs(value) <= 90;
    }
    if (field === 'decimalLongitude') {
      return Math.abs(value) <= 180;
    }
    return false;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a valid coordinate value`;
  }
}

// src/utils/validation/pipes.ts
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ValidationErrorException } from '../../common/exceptions/validation-error.exception';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      throw new ValidationErrorException(errors);
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
