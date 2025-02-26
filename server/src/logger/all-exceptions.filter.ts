import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CustomLoggerService } from '../logger/logger.service';
import { AdminService } from '../admin/admin.service';

@Injectable()
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly logger: CustomLoggerService,
    private readonly adminService?: AdminService,
  ) {
    this.logger.setContext(AllExceptionsFilter.name);
    if (adminService) {
      this.logger.setAdminService(adminService);
    }
  }

  catch(exception: Error, host: ArgumentsHost) {
    // Get context type
    const contextType = host.getType();

    // Log the error with full context
    const errorContext = {
      type: contextType,
      message: exception.message,
      stack: exception.stack,
      timestamp: new Date().toISOString()
    };
    
    this.logger.error(
      `[${contextType.toUpperCase()}] ${exception.message}`, 
      exception
    );

    // Handle HTTP context responses
    if (contextType === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const status = exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

      response.status(status).json({
        statusCode: status,
        message: exception.message,
        timestamp: errorContext.timestamp,
      });
    }
    
    // For RPC context (if using)
    else if (contextType === 'rpc') {
      // Let the RPC exception handler deal with it
      throw exception;
    }
  }
}
