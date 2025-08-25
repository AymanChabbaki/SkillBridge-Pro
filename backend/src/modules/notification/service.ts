import { NotificationRepository } from './repository';
// Require nodemailer at runtime to keep optional dependency behavior
let nodemailer: any;
try {
  // eslint-disable-next-line global-require
  nodemailer = require('nodemailer');
} catch (e) {
  nodemailer = null;
}

export class NotificationService {
  constructor(private repo: NotificationRepository) {}

  async createInApp(userId: string, type: string, title: string, body?: string, data?: any) {
    return this.repo.create({ userId, type, title, body, data });
  }

  async sendEmailIfConfigured(toEmail: string, subject: string, html: string) {
    const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } = process.env;
    if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) return null;

    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: Number(EMAIL_PORT),
      secure: Number(EMAIL_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: EMAIL_FROM || EMAIL_USER,
      to: toEmail,
      subject,
      html,
    });

    return info;
  }
}
