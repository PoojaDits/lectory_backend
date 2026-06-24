import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../common/enums/user-role.enum';
import { UsersService } from './users.service';

@Injectable()
export class AdminSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeederService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    await this.seedAdmin();
  }

  private async seedAdmin() {
    const email = this.configService.get<string>('ADMIN_EMAIL') ?? 'admin@lectory.com';
    const password = this.configService.get<string>('ADMIN_PASSWORD') ?? 'Admin@123456';
    const firstName = this.configService.get<string>('ADMIN_FIRST_NAME') ?? 'Admin';
    const lastName = this.configService.get<string>('ADMIN_LAST_NAME') ?? 'User';

    const admin = await this.usersService.upsertAdmin(
      {
        role: UserRole.ADMIN,
        email,
        firstName,
        lastName,
        isActive: true,
        isEmailVerified: true,
      },
      password,
    );

    this.logger.log(`Admin user ready: ${admin.email}`);
  }
}
