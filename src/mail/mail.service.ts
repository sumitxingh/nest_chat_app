import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import path from 'path';
@Injectable()
export class MailService {

  private transporter: nodemailer.Transporter; // Email transport object
  private emailId: string; // Sender's email address
  private resetPasswordTemplate: HandlebarsTemplateDelegate;


  constructor(private configService: ConfigService) {
    this.emailId = this.configService.get<string>('EMAIL_ID');
    this.transporter = this.createTransporter(); // Initialize email transporter
    // this.loadResetPasswordTemplate(); // Load email template
  }

  private createTransporter(): nodemailer.Transporter {
    const emailPass = this.configService.get<string>('EMAIL_PASS');
    return nodemailer.createTransport({
      service: 'Gmail',
      auth: { user: this.emailId, pass: emailPass },
    });
  }

  

  private loadResetPasswordTemplate() {
    const templatePath = this.getTemplatePath('reset-password.hbs');
    this.resetPasswordTemplate = this.compileTemplate(templatePath);
  }

  private getTemplatePath(templateName: string): string {
    return path.join(__dirname, '../../../public/views/templates', templateName);
  }

  private compileTemplate(templatePath: string): HandlebarsTemplateDelegate {
    return Handlebars.compile(fs.readFileSync(templatePath, 'utf-8'));
  }


  async sendEmail({
    to,
    subject,
    templateData
  }: {
    to: string;
    subject: string;
    templateData: Record<string, any>;
  }): Promise<Object> {
    try {
      const html = this.resetPasswordTemplate(templateData);
      const mailOptions = this.buildMailOptions(to, subject, html, templateData);
      const res = await this.transporter.sendMail(mailOptions);
      if (res.accepted && res.accepted.length > 0) {
        return { message: 'Message sent successfully.' };
      } else {
        return { message: 'Message failed, please try again' };
      }
    } catch (error) {
      throw new Error(`Failed to send email: ${error}`);
    }
  }

  private buildMailOptions(
    to: string,
    subject: string,
    html: string,
    templateData: Record<string, any>,
  ): nodemailer.SendMailOptions {
    return { from: this.emailId, to, subject, html, context: templateData };
  }
}