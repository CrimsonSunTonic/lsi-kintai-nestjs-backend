import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com', 
        port: 587,
        secure: false,
        auth: {
          user: process.env.ORG_MAIL, 
          pass: process.env.ORG_PASS_APP, 
        },
      },
      defaults: {
        from: '"勤怠システム" <no-reply@company.com>',
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
