import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

/**
 * Handles authentication-related HTTP routes.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/auth/login
   * Expects { username, password } in body.
   * Returns an access token or throws 401.
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const token = await this.authService.validateAndLogin(loginDto);
    if (!token) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return { accessToken: token };
  }
}
