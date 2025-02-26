import { Injectable, ConsoleLogger, LoggerService, NotFoundException } from '@nestjs/common';
import { AdminService } from '../admin/admin.service';

@Injectable()
export class CustomLoggerService extends ConsoleLogger implements LoggerService {
  private adminService?: AdminService;

  constructor(context: string) {
    super(context);
  }

  setAdminService(adminService: AdminService) {
    this.adminService = adminService;
  }

  info(message: any, ...optionalParams: any[]) {
    super.log(message, ...optionalParams);
    if (this.adminService) {
      this.adminService.broadcastToAdmins(message).catch(() => {});
    }
  }

  warn(message: any, ...optionalParams: any[]) {
    super.warn(message, ...optionalParams);
    if (this.adminService) {
      this.adminService.broadcastToAdmins(`⚠️ WARNING: ${message}`).catch(() => {});
    }
  }

  error(message: any, ...optionalParams: any[]) {
    const exception = optionalParams.find(param => param instanceof Error);

    // skip not found exceptions
    if (exception instanceof NotFoundException) return;

    const stack = exception?.stack || '';
    super.error(message, stack);

    if (this.adminService) {
      this.adminService.broadcastToAdmins(`❌ ERROR: ${message}\n${stack}`).catch(() => {});
    }
  }
}
