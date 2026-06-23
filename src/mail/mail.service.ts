import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../common/enums';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private mailer: MailerService,
    private config: ConfigService,
  ) {}

  async sendOtpEmail(
    to: string,
    otp: string,
    name?: string,
    role?: UserRole,
  ) {
    const expireMinutes = this.config.get('OTP_EXPIRE_MINUTES', 5);

    try {
      await this.mailer.sendMail({
        to,
        subject: `Your Lectory verification code: ${otp}`,
        template: 'otp',
        context: {
          otp,
          name: name || to.split('@')[0],
          expireMinutes,
          role,
          year: new Date().getFullYear(),
        },
      });
      this.logger.log(`OTP email sent to ${to}`);
      return true;
    } catch (err: any) {
      this.logger.error(`Failed to send OTP email to ${to}: ${err.message}`, err.stack);
      // Don't crash registration if email fails – OTP is still logged
      // Remove this try/catch if you want to fail hard on mail errors
      return false;
    }
  }

  // For later: seller approval notifications
  async sendSellerApprovedEmail(to: string, contactPerson: string) {
    try {
      await this.mailer.sendMail({
        to,
        subject: 'Your seller account has been approved!',
        template: 'seller-approved',
        context: { name: contactPerson, year: new Date().getFullYear() },
      });
      return true;
    } catch (err: any) {
      this.logger.error(`Failed to send seller-approved email: ${err.message}`);
      return false;
    }
  }
}
