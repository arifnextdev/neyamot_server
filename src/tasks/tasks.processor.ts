import {
  ConflictException,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import axios from 'axios';
import { Worker, Job } from 'bullmq';
import { MailService } from 'src/mail/mail.service';
import * as https from 'https';

import { ConfigService } from '@nestjs/config';
import { TasksService } from './tasks.service';

export interface CreateCpanelAccountParams {
  userId: string;
  orderId: string;
  userName: string;
  password: string;
  email: string;
  domain: string;
  plan: string;
}

export interface CpanelCreateResponse {
  success: boolean;
  message: string;
  details?: any;
}

@Injectable()
export class TasksWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TasksWorker.name);
  private worker: Worker;
  private isInitialized = false;

  constructor(
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly taskService: TasksService,
  ) {
    this.logger.log('📦 TasksWorker instance created');
  }

  onModuleInit() {
    if (this.isInitialized) {
      this.logger.warn('⚠️ Worker already initialized. Skipping...');
      return;
    }

    this.isInitialized = true;
    this.logger.log('🚀 Initializing BullMQ Worker for queue: provision');

    this.worker = new Worker(
      'provision',
      async (job: Job) => {
        this.logger.log(`🎯 Processing job [${job.name}] with ID ${job.id}`);
        try {
          switch (job.name) {
            case 'create-cpanel-account':
              this.logger.log('🛠 Creating cPanel account...');
              // implement your logic here
              const response = await this.createCpanelAccount(
                job.data as CreateCpanelAccountParams,
              );

              if (response.success) {
                this.logger.log('✅ cPanel account created successfully');
                this.mailService.sendCpanelAccountToCustomer({
                  userName: job.data.userName,
                  password: job.data.password,
                  email: job.data.email,
                  domain: job.data.domain,
                });
                this.mailService.sendAdminAlertEmail(
                  'cPanel Account Created',
                  `cPanel account created for user ${job.data.userId}`,
                  job.data.userId,
                );
              } else {
                this.logger.error(
                  '❌ Failed to create cPanel account:',
                  response.message,
                );
                this.mailService.sendAdminAlertEmail(
                  'cPanel Account Creation Failed',
                  `Failed to create cPanel account for user ${job.data.userId}: ${response.message}`,
                  job.data.userId,
                );
                throw new ConflictException(response.message);
              }
              break;

            case 'setup-vps':
              this.logger.log('🖥 Setting up VPS...');
              // implement your logic here
              break;

            case 'provision-email':
              this.logger.log('📧 Provisioning email...');
              console.log(job.data);
              await this.mailService.sendOrderEmailWithInvoice(job.data);
              break;

            default:
              this.logger.warn(`⚠️ Unknown job name: ${job.name}`);
          }
        } catch (err) {
          this.logger.error(
            `❌ Error processing job ${job.id}: ${err.message}`,
            err.stack,
          );
          throw err; // re-throw so the job is marked as failed
        }
      },
      {
        connection: {
          host: 'localhost',
          port: 6379,
        },
      },
    );

    this.worker.on('completed', (job) => {
      this.logger.log(`✅ Job ${job.id} [${job.name}] completed`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(
        `❌ Job ${job?.id} [${job?.name}] failed: ${err.message}`,
        err.stack,
      );
    });
  }

  async onModuleDestroy() {
    this.logger.log('🧹 Shutting down TasksWorker...');
    if (this.worker) {
      await this.worker.close();
      this.logger.log('✅ Worker closed successfully');
    }
  }

  private async createCpanelAccount({
    userName,
    password,
    email,
    domain,
    plan,
  }: CreateCpanelAccountParams): Promise<CpanelCreateResponse> {
    const WHM_API_TOKEN = this.configService.get<string>('WHM_API_TOKEN');
    const WHM_HOST = this.configService.get<string>('WHM_HOST');
    const WHM_USERNAME = this.configService.get<string>('WHM_USERNAME');

    if (!WHM_API_TOKEN || !WHM_HOST || !WHM_USERNAME) {
      throw new Error('WHM credentials are not properly configured.');
    }

    const url = `${WHM_HOST}/json-api/createacct`;

    const params = new URLSearchParams({
      'api.version': '1',
      username: userName,
      domain,
      password,
      contactemail: email,
      plan,
    });

    try {
      const response = await axios.post(url, params.toString(), {
        headers: {
          Authorization: `whm ${WHM_USERNAME}:${WHM_API_TOKEN}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false, // Use true in production with valid certs
        }),
        timeout: 15000,
      });

      console.log('WHM API Response:', response.data);

      const resData = response.data;

      if (resData?.metadata?.result !== 1) {
        const errorMsg =
          resData?.metadata?.reason || resData?.statusmsg || 'Unknown error';
        throw new ConflictException({
          message: 'cPanel account creation failed',
          error: errorMsg,
        });
      }

      return {
        success: true,
        message: 'cPanel account created successfully.',
        details: resData,
      };
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const errData = error.response?.data;
        const errMsg =
          errData?.metadata?.reason ||
          errData?.statusmsg ||
          error.message ||
          'Unknown Axios error';

        console.error('WHM API Error:', {
          status: error.response?.status,
          reason: errMsg,
          response: errData,
          requestURL: error.config?.url,
          method: error.config?.method,
        });

        throw new ConflictException(`cPanel creation failed: ${errMsg}`);
      }

      throw new ConflictException(`Unexpected error: ${error.message}`);
    }
  }
}
