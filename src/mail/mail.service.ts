import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../common/enums';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly from: string;
  private readonly templatesAvailable: boolean;

  constructor(
    private mailer: MailerService,
    private config: ConfigService,
  ) {
    this.from =
      this.config.get<string>('MAIL_FROM') ||
      `"Lectory" <${this.config.get<string>('MAIL_USER')}>`;

    // Check if handlebars templates exist
    const templatePaths = [
      path.join(process.cwd(), 'src', 'mail', 'templates', 'otp.hbs'),
      path.join(process.cwd(), 'dist', 'mail', 'templates', 'otp.hbs'),
      path.join(process.cwd(), 'dist', 'src', 'mail', 'templates', 'otp.hbs'),
    ];
    this.templatesAvailable = templatePaths.some((p) => fs.existsSync(p));

    if (!this.templatesAvailable) {
      this.logger.warn(
        'Handlebars templates not found – will use inline HTML. ' +
          'Check nest-cli.json assets config.',
      );
    }
  }

  async sendOtpEmail(
    to: string,
    otp: string,
    name?: string,
    role?: UserRole,
  ): Promise<boolean> {
    const expireMinutes = Number(this.config.get('OTP_EXPIRE_MINUTES', 5));
    const mailUser = this.config.get<string>('MAIL_USER');
    const mailPass = this.config.get<string>('MAIL_PASS');

    const displayName = (name?.trim() || to.split('@')[0]).replace(
      /[<>]/g,
      '',
    );
    const roleLabel =
      role === UserRole.SELLER
        ? 'seller'
        : role === UserRole.CUSTOMER
          ? 'customer'
          : 'account';

    const subject =
      role === UserRole.SELLER
        ? `Verify your seller account – ${otp}`
        : `Your Lectory verification code: ${otp}`;

    // Always log OTP – dev fallback + audit
    this.logger.log(`OTP for ${to}: ${otp} (expires ${expireMinutes}m)`);

    if (!mailUser || !mailPass) {
      this.logger.warn(
        `SMTP credentials missing (MAIL_USER / MAIL_PASS). OTP logged above – email NOT sent.`,
      );
      return false;
    }

    // Try Handlebars template first if files exist
    if (this.templatesAvailable) {
      try {
        await this.mailer.sendMail({
          to,
          from: this.from,
          subject,
          template: './otp', // ./ is required – resolves relative to template.dir
          context: {
            otp,
            name: displayName,
            expireMinutes,
            role: roleLabel,
            year: new Date().getFullYear(),
          },
        });
        this.logger.log(`✓ OTP email sent to ${to} (handlebars template)`);
        return true;
      } catch (err: any) {
        this.logger.warn(
          `Handlebars template failed: ${err.message} – falling back to inline HTML`,
        );
        // fall through to inline HTML
      }
    }

    // Inline HTML fallback – always works, no .hbs file needed
    const html = `<!DOCTYPE html><html><body style="margin:0;background:#f4f5f7;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:40px 0">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)">
<tr><td style="background:#111827;padding:28px;text-align:center">
<h1 style="margin:0;color:#fff;font-size:22px">Lectory</h1>
<p style="margin:6px 0 0;color:#9ca3af;font-size:13px">${roleLabel} account verification</p>
</td></tr>
<tr><td style="padding:32px">
<p style="color:#374151;font-size:15px">Hi ${displayName},</p>
<p style="color:#4b5563;font-size:14px;line-height:1.6">Use the code below to verify your email. Expires in <b>${expireMinutes} minutes</b>.</p>
<div style="text-align:center;margin:24px 0">
<div style="display:inline-block;background:#f9fafb;border:2px dashed #d1d5db;border-radius:10px;padding:20px 32px;font-size:32px;font-weight:700;letter-spacing:8px;font-family:'Courier New',monospace;color:#111827">${otp}</div>
</div>
<p style="color:#6b7280;font-size:13px">Never share this code with anyone.</p>
</td></tr>
<tr><td style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px">© ${new Date().getFullYear()} Lectory</td></tr>
</table>
</td></tr></table>
</body></html>`;

    try {
      await this.mailer.sendMail({
        to,
        from: this.from,
        subject,
        html,
      });
      this.logger.log(`✓ OTP email sent to ${to} (inline HTML)`);
      return true;
    } catch (err: any) {
      this.logger.error(
        `✗ SMTP send failed to ${to}: ${err.message}`,
        err.stack,
      );
      this.logger.warn(`DEV FALLBACK – OTP for ${to}: ${otp}`);
      return false;
    }
  }

  async sendSellerApprovedEmail(
    to: string,
    contactPerson: string,
  ): Promise<boolean> {
    const name = contactPerson?.replace(/[<>]/g, '') || 'Seller';
    try {
      if (this.templatesAvailable) {
        try {
          await this.mailer.sendMail({
            to,
            from: this.from,
            subject: 'Your seller account has been approved!',
            template: './seller-approved',
            context: { name, year: new Date().getFullYear() },
          });
          return true;
        } catch {
          // fall through
        }
      }
      await this.mailer.sendMail({
        to,
        from: this.from,
        subject: 'Your seller account has been approved!',
        html: `<p>Hi ${name},<br><br>Great news! Your seller account has been approved. You can now log in to your seller dashboard.<br><br>– Lectory Team</p>`,
      });
      return true;
    } catch (err: any) {
      this.logger.error(`seller-approved email failed: ${err.message}`);
      return false;
    }
  }
}
