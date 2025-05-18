import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { AppError } from '../interfaces/app-error.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const error: AppError = {
      code: 'INTERNAL_ERROR',
      message: exception.message,
      timestamp: new Date().toISOString(),
    };

    response.status(500).json({ error });
  }
}
