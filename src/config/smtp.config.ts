import * as dotenv from 'dotenv';
dotenv.config();

import { join } from 'path';

import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import type { MailerOptions } from '@nestjs-modules/mailer';

// console.log(join(__dirname + './../mails/templates'));

const smtpConfig: MailerOptions = {
  // transport: `smtps://${process.env.SMTP_USER}:${process.env.SMTP_PASSWORD}@${process.env.SMTP_HOST}`,
  // or

  transport: {
    host: process.env.SMTP_HOST,
    port: +process.env.SMTP_PORT,
    secure: +process.env.SMTP_PORT === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  },
  defaults: {
    from: '"bibashrajthala.com" <noreply@example.com>',
  },
  preview: process.env.NODE_ENV === 'development',
  template: {
    dir: join(__dirname + './../mails/templates'),
    adapter: new HandlebarsAdapter(undefined, {
      inlineCssEnabled: true,
      inlineCssOptions: {
        url: ' ',
        preserveMediaQueries: true,
      },
    }),
    options: {
      strict: true,
    },
  },
};

export default smtpConfig;
