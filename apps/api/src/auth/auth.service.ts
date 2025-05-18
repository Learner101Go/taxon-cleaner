// src/app/auth/auth.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '../config/config.service';
import { LoginDto } from './dto/login.dto';
import { AxiosResponse } from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private readonly http: HttpService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService
  ) {}

  /**
   * Validates credentials against Symbiota2,
   * then signs & returns our own JWT.
   */
  async validateAndLogin(loginDto: LoginDto): Promise<string | null> {
    const s2Url = `${this.config.get('SYMBIOTA_API')}/auth/login`;
    let s2Response: AxiosResponse<any, LoginDto>;
    try {
      // Wrap Observable in Promise with firstValueFrom
      s2Response = await firstValueFrom(this.http.post(s2Url, loginDto));
    } catch {
      // Invalid creds or network failure
      return null;
    }

    const user = s2Response.data;
    if (!user || !user.id) {
      throw new UnauthorizedException('Invalid Symbiota2 response');
    }

    // Sign our own token
    return this.jwtService.sign(
      { sub: user.id, username: user.username },
      { secret: process.env.JWT_SECRET }
    );
  }
}
