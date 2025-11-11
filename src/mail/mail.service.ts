import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly loginUrl: string;

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {
    // Extract the first FRONTEND_URL
    const frontendUrls = this.configService
      .get<string>('FRONTEND_URLS')
      ?.split(',')
      .map((url) => url.trim());
    this.loginUrl = `${frontendUrls?.[0]}/login`;
  }

  async sendWelcomeEmail(email: string, password: string, name: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: '【勤怠システム】アカウント登録完了のお知らせ',
        html: `
          <div style="font-family: 'Segoe UI', sans-serif; color: #333;">
            <h2>勤怠システムへようこそ、${name} さん！</h2>
            <p>以下の情報でログインできます。</p>
            <table style="border-collapse: collapse; margin-top: 12px;">
              <tr>
                <td><b>ログインURL:</b></td>
                <td>
                  <a href="${this.loginUrl}" target="_blank">${this.loginUrl}</a>
                </td>
              </tr>
              <tr>
                <td><b>メールアドレス:</b></td>
                <td style="padding-left: 15px;">${email}</td>
              </tr>
              <tr>
                <td><b>パスワード:</b></td>
                <td style="color: #d32f2f;">${password}</td>
              </tr>
            </table>
            <p style="margin-top: 20px;">セキュリティのため、ログイン後にパスワードを変更してください。</p>
            <br/>
            <p>勤怠システム 管理部</p>
          </div>
        `,
      });
      console.log(`✅ Welcome email sent to ${email}`);
    } catch (error) {
      console.error(`❌ Failed to send welcome email to ${email}`, error);
    }
  }
}
