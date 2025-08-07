import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(readonly mailService: MailService) {}

  // Define your endpoints here, for example:
  @Post('send')
  async sendEmail(
    @Body()
    body: {
      email?: string;
      description: string;
      subject?: string;
      userId?: string;
    },
  ) {
    const { email, description, subject, userId } = body;

    if (!description) {
      throw new Error('Description is required');
    }
    // Call the mail service to send the email
    return this.mailService.sendEmail(email, description, subject, userId);
  }
}
