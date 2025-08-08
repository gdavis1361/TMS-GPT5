import { Injectable } from '@nestjs/common'
import nodemailer from 'nodemailer'

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: Number(process.env.SMTP_PORT || 1025),
    secure: false,
  })

  async sendVerificationEmail(to: string, link: string): Promise<void> {
    if (process.env.NODE_ENV === 'test') return
    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM || 'no-reply@example.com',
        to,
        subject: 'Verify your email',
        text: `Verify your email: ${link}`,
      })
    } catch {
      // ignore mail errors in non-critical paths
    }
  }

  async sendPasswordResetEmail(to: string, link: string): Promise<void> {
    if (process.env.NODE_ENV === 'test') return
    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM || 'no-reply@example.com',
        to,
        subject: 'Reset your password',
        text: `Reset your password: ${link}`,
      })
    } catch {
      // ignore mail errors in non-critical paths
    }
  }
}
