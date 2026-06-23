import {
  Body,
  Controller,
  Post,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  VerifyOtpDto,
  ResendOtpDto,
  RefreshTokenDto,
} from './dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import {
  RegisterResponse,
  LoginResponse,
  RefreshResponse,
} from '../common/interfaces';
import { UserDocument } from '../users/users.schema';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Step 1: Register (customer or seller)
  @Post('register')
  register(@Body() dto: RegisterDto): Promise<RegisterResponse> {
    return this.authService.register(dto);
  }

  // Step 2: Verify OTP from email
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  verifyOtp(@Body() dto: VerifyOtpDto): Promise<{ message: string }> {
    return this.authService.verifyOtp(dto);
  }

  // Resend OTP
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  resendOtp(@Body() dto: ResendOtpDto): Promise<{ message: string }> {
    return this.authService.resendOtp(dto.email);
  }

  // Step 3: Login - passport-local validates email/password/otp/sellerStatus
  // LocalAuthGuard runs LocalStrategy -> validate() -> req.user = UserDocument
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: LoginDto })
  async login(
    @Req() req: { user: UserDocument },
  ): Promise<LoginResponse> {
    return this.authService.login(req.user);
  }

  // Step 4: Refresh tokens
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: RefreshTokenDto })
  refresh(
    @Req() req: { user: { userId: string; refreshToken: string } },
  ): Promise<RefreshResponse> {
    // JwtRefreshStrategy puts { userId, refreshToken } in req.user
    return this.authService.refresh(req.user.userId, req.user.refreshToken);
  }

  // Logout - invalidate refresh token
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(
    @CurrentUser('userId') userId: string,
  ): Promise<{ message: string }> {
    return this.authService.logout(userId);
  }
}
