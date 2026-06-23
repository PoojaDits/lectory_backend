import { ConfigService } from '@nestjs/config';
import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as path from 'path';
import * as fs from 'fs';

export const getMailConfig = (
  configService: ConfigService,
): MailerOptions => {
  // Find templates in dev (src/) or prod (dist/)
  // Order matters: check dist first in production
  const candidates = [
    path.join(process.cwd(), 'dist', 'mail', 'templates'),
    path.join(process.cwd(), 'dist', 'src', 'mail', 'templates'),
    path.join(process.cwd(), 'src', 'mail', 'templates'),
    path.join(__dirname, '..', 'mail', 'templates'),
    path.join(__dirname, '..', '..', 'src', 'mail', 'templates'),
  ];

  const templateDir = candidates.find((d) => {
    try {
      return fs.existsSync(d) && fs.existsSync(path.join(d, 'otp.hbs'));
    } catch {
      return false;
    }
  });

  if (!templateDir) {
    console.warn(
      `\n⚠️  Mail templates not found. Searched:\n  ${candidates.join('\n  ')}\nMailService will use inline HTML fallback.\n`,
    );
  }

  const finalTemplateDir = templateDir || candidates[2]; // fallback to src/mail/templates

  return {
    transport: {
      host: configService.get<string>('MAIL_HOST', 'smtp.gmail.com'),
      port: parseInt(configService.get<string>('MAIL_PORT', '587'), 10),
      secure: configService.get<string>('MAIL_SECURE', 'false') === 'true', // true = 465, false = 587
      auth: {
        user: configService.get<string>('MAIL_USER'),
        pass: configService.get<string>('MAIL_PASS'),
      },
      tls: {
        rejectUnauthorized: false,
      },
      debug: configService.get<string>('MAIL_DEBUG', 'false') === 'true',
      logger: configService.get<string>('MAIL_DEBUG', 'false') === 'true',
    },
    defaults: {
      from:
        configService.get<string>('MAIL_FROM') ||
        `"Lectory" <${configService.get<string>('MAIL_USER')}>`,
    },
    template: {
      dir: finalTemplateDir,
      adapter: new HandlebarsAdapter(undefined, {
        inlineCssEnabled: true,
      }),
      options: {
        strict: false, // <-- was true, caused "Cannot destructure property 'templateName'"
      },
    },
  };
};
