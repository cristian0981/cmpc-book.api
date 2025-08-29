
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ValidationError, UniqueConstraintError } from 'sequelize';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';

    // Errores personalizados de Sequelize
    if (exception instanceof ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.errors.map((err) => err.message).join(', '); // Messages defined in `msg`
    } else if (exception instanceof UniqueConstraintError) {
      status = HttpStatus.CONFLICT;
      message = exception.errors.map((err) => err.message).join(', '); // Messages defined in `msg`
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse() as string;
    }

    response.status(status).json({
      statusCode: status,
      error: message,
      timestamp: new Date().toISOString(),
    });
  }
}
