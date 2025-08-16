import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from 'src/product/common/zodValidationPipe';
import { AuthService } from './auth.service';
import { CreateUserDto, CreateUserSchema } from './dto/user.dto';
import { UserLoginDto, UserLoginSchema } from './dto/user.login.dto';

import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import {
  ForgotPasswordDto,
  ForgotPasswordSchema,
} from './dto/forgot-password.dto';
import {
  ResetPasswordDto,
  ResetPasswordSchema,
} from './dto/reset-password.dto';
import { RoleGuard } from 'src/roles/guards';
import { Roles } from 'src/roles/decorator';
import { Role } from 'src/roles/enum';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UsePipes(new ZodValidationPipe(UserLoginSchema))
  login(@Body() dto: UserLoginDto, @Req() req: Request) {
    return this.authService.signIn(dto, req);
  }

  @Post('register')
  @UsePipes(new ZodValidationPipe(CreateUserSchema))
  register(@Body() dto: CreateUserDto) {
    return this.authService.signUp(dto);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
 
  me(@Req() req: Request) {
    return this.authService.me(
      req.user as {
        userId: string;
        email: string;
        roles: string[];
        status: string;
      },
    );
  }

  @Post('refresh-token')
  refresh(@Req() req: Request) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) throw new UnauthorizedException('Invalid refresh token');
    return this.authService.refreshTokens(refreshToken);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('refreshToken');
    return res.json({ message: 'Logged out successfully' });
  }

  @Post('forgot-password')
  @UsePipes(new ZodValidationPipe(ForgotPasswordSchema))
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password/:token')
  resetPassword(@Param('token') token: string, @Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(token, dto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleRedirect(@Req() req: Request, @Res() res: Response) {
    console.log(req.user);
    const jwt = await this.authService.socialLogin(req.user, 'GOOGLE');
    console.log(jwt);
    res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth-callback?token=${jwt.accessToken}`,
    );
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth() {}

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookRedirect(@Req() req: Request, @Res() res: Response) {
    console.log(req.user);
    const jwt = await this.authService.socialLogin(req.user, 'FACEBOOK');
    console.log(jwt);
    res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth-callback?token=${jwt.accessToken}`,
    );
  }
}
