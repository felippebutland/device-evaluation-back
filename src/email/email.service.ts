import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendSubmissionConfirmation(
    email: string,
    trackingCode: string,
    deviceName: string
  ) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Submissão Recebida - ' + trackingCode,
        template: 'submission-confirmation',
        context: {
          trackingCode,
          deviceName,
          frontendUrl: this.configService.get<string>('FRONTEND_URL'),
        },
      });

      this.logger.log(`Email de confirmação enviado para ${email}`);
    } catch (error) {
      // @ts-ignore
        this.logger.error(`Erro ao enviar email de confirmação: ${error.message}`);
      throw error;
    }
  }

  async sendEvaluationApproved(
    email: string,
    trackingCode: string,
    deviceName: string,
    finalPrices: any[],
    validUntil: Date
  ) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Avaliação Aprovada - ' + trackingCode,
        template: 'evaluation-approved',
        context: {
          trackingCode,
          deviceName,
          finalPrices,
          validUntil: validUntil.toLocaleDateString('pt-BR'),
          frontendUrl: this.configService.get<string>('FRONTEND_URL'),
        },
      });

      this.logger.log(`Email de aprovação enviado para ${email}`);
    } catch (error) {
      // @ts-ignore
        this.logger.error(`Erro ao enviar email de aprovação: ${error.message}`);
      throw error;
    }
  }

  async sendEvaluationRejected(
    email: string,
    trackingCode: string,
    deviceName: string,
    rejectionReason: string
  ) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Avaliação Rejeitada - ' + trackingCode,
        template: 'evaluation-rejected',
        context: {
          trackingCode,
          deviceName,
          rejectionReason,
          frontendUrl: this.configService.get<string>('FRONTEND_URL'),
        },
      });

      this.logger.log(`Email de rejeição enviado para ${email}`);
    } catch (error) {
      // @ts-ignore
        this.logger.error(`Erro ao enviar email de rejeição: ${error.message}`);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, name: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Bem-vindo ao Sistema de Avaliação',
        template: 'welcome',
        context: {
          name,
          frontendUrl: this.configService.get<string>('FRONTEND_URL'),
        },
      });

      this.logger.log(`Email de boas-vindas enviado para ${email}`);
    } catch (error) {
      // @ts-ignore
        this.logger.error(`Erro ao enviar email de boas-vindas: ${error.message}`);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, name: string, resetToken: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Redefinição de Senha',
        template: 'password-reset',
        context: {
          name,
          resetToken,
          frontendUrl: this.configService.get<string>('FRONTEND_URL'),
        },
      });

      this.logger.log(`Email de redefinição de senha enviado para ${email}`);
    } catch (error) {
      // @ts-ignore
        this.logger.error(`Erro ao enviar email de redefinição: ${error.message}`);
      throw error;
    }
  }

  async sendAdminNotification(
    adminEmails: string[],
    subject: string,
    message: string,
    data?: any
  ) {
    try {
      await Promise.all(
        adminEmails.map(email =>
          this.mailerService.sendMail({
            to: email,
            subject: `[ADMIN] ${subject}`,
            template: 'admin-notification',
            context: {
              message,
              data,
              frontendUrl: this.configService.get<string>('FRONTEND_URL'),
            },
          })
        )
      );

      this.logger.log(`Notificação admin enviada para ${adminEmails.length} administradores`);
    } catch (error) {
      // @ts-ignore
        this.logger.error(`Erro ao enviar notificação admin: ${error.message}`);
      throw error;
    }
  }
}
