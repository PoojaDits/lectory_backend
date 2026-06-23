import { ConfigService } from '@nestjs/config';
import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as path from 'path';

export const getMailConfig = (
  configService: ConfigService,
): MailerOptions => ({
  transport: {
    host: configService.get<string>('MAIL_HOST'),
    port: configService.get<number>('MAIL_PORT'),
    secure: configService.get<string>('MAIL_SECURE') === 'true',
    auth: {
      user: configService.get<string>('MAIL_USER'),
      pass: configService.get<string>('MAIL_PASS'),
    },
    debug: configService.get<string>('MAIL_DEBUG') === 'true',
    logger: configService.get<string>('MAIL_DEBUG') === 'true',
  },
  defaults: {
    from: configService.get<string>('MAIL_FROM', '"Lectory" <noreply@lectory.com>'),
  },
  template: {
    dir: path.join(process.cwd(), 'src', 'mail', 'templates'),
    adapter: new HandlebarsAdapter(),
    options: { strict: true },
  },
});
