import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/user.dto';
import { UserLoginDto } from './dto/user.login.dto';
import { MailService } from '../mail/mail.service';
import { randomBytes, createHash } from 'crypto';
import { ResetPasswordSchema } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async signUp(dto: CreateUserDto) {
    const existUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existUser) {
      throw new UnauthorizedException('User already exists');
    }

    const hashPassword = await bcrypt.hash(dto.password || '', 10);

    const username = this.generateUniqueUserName(dto.name || '', dto.email);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashPassword,
        name: dto.name,
        username,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        roles: true,
        status: true,
      },
    });

    return user;
  }

  async signIn(dto: UserLoginDto, req: Request) {
    // const requestIp =
    //   (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    //   req.socket.remoteAddress ||
    //   req.connection.remoteAddress;

    // const allowedRanges = ['103.250.70.', '103.251.247.', '103.251.245.'];

    // const isAllowedIp = allowedRanges.some((range) =>
    //   requestIp?.startsWith(range),
    // );

    // if (!isAllowedIp) {
    //   throw new UnauthorizedException('You are not allowed to access');
    // }

    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    console.log(user);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.provider !== 'CREDENTIAL') {
      throw new UnauthorizedException('You are not allowed to access');
    }

    if (user.status !== 'ACTIVE') {
      await this.prisma.loginHistory.create({
        data: {
          userId: user.id,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          attempt: 'FAILED',
        },
      });
      throw new UnauthorizedException('User is not active');
    }

    const isPasswordCorrect = await bcrypt.compare(dto.password, user.password || '');

    if (!isPasswordCorrect) {
      await this.prisma.loginHistory.create({
        data: {
          userId: user.id,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          attempt: 'FAILED',
        },
      });
      throw new UnauthorizedException('Password is incorrect');
    }

    await this.prisma.loginHistory.create({
      data: {
        userId: user.id,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        attempt: 'SUCCESS',
      },
    });

    console.log('User logged in successfully:', user.email);

    return this.generateTokens(user.id, user.email, user.roles, user.status);
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal that the user doesn't exist
      return {
        message:
          'If a user with that email exists, a password reset link has been sent.',
      };
    }

    const resetToken = randomBytes(32).toString('hex');
    const passwordResetToken = createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.prisma.user.update({
      where: { email },
      data: {
        passwordResetToken,
        passwordResetExpires,
      },
    });

    // In a real app, you'd use a proper URL
    const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password/${resetToken}`;

    try {
      await this.mailService.sendPasswordResetEmail(user, resetURL);
      return { message: 'Password reset email sent' };
    } catch (error) {
      // In production, you would want to log this error
      console.error(error);
      // Reset the fields on failure to prevent a user from being locked out
      await this.prisma.user.update({
        where: { email },
        data: {
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });
      throw new Error('Could not send password reset email.');
    }
  }

  async resetPassword(token: string, dto: any) {
    const parsedata = ResetPasswordSchema.safeParse(dto);
    if (!parsedata.success) {
      throw new UnauthorizedException('Invalid password reset data');
    }
    const hashedToken = createHash('sha256').update(token).digest('hex');

    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Token is invalid or has expired');
    }

    const hashedPassword = await bcrypt.hash(parsedata.data.password || '', 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        refreshToken: null, // Also invalidate refresh tokens
      },
    });

    return { message: 'Password has been reset successfully.' };
  }

  async socialLogin(
    googleUser: any,
    provider: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const { email, name, picture } = googleUser;

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          avatar: picture,
          provider: provider === 'google' ? 'GOOGLE' : 'FACEBOOK',
          username: this.generateUniqueUserName(name, email),
        },
      });
    }

    return this.generateTokens(user.id, user.email, user.roles, user.status);
  }

  async me(user: {
    userId: string;
    email: string;
    roles: string[];
    status: string;
  }) {
    const existUser = await this.prisma.user.findUnique({
      where: {
        id: user.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        roles: true,
        status: true,
      },
    });

    if (!existUser || existUser.status !== 'ACTIVE') {
      throw new UnauthorizedException('User is not active');
    }

    return existUser;
  }

  async refreshTokens(refreshToken: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        refreshToken,
      },
    });

    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.generateTokens(user.id, user.email, user.roles, user.status);
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: null,
      },
    });

    return { message: 'Logged out successfully' };
  }

  private async generateTokens(
    userId: string,
    email: string,
    roles: string[],
    status: string,
  ) {
    const payload = { userId, email, roles, status };

    console.log('Generating tokens for user:', email);

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: process.env.JWT_SECRET || 'default_secret_key',
    });

    const refreshToken = randomBytes(64).toString('hex');

    return {
      accessToken,
      refreshToken,
    };
  }

  private generateUniqueUserName(name: string, email: string) {
    return `${email.split('@')[0]}_${new Date().getMilliseconds()}_${name
      .split(' ')[0]
      .slice(0, 2)}`;
  }
}
