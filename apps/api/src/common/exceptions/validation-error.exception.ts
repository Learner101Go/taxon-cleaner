// src/common/exceptions/validation-error.exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidationErrorException extends HttpException {
  constructor(message: string | object) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
