// src/app/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; // Correct HTTP module
import { JwtModule } from '@nestjs/jwt'; // JWT utilities
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    // 1. HttpModule for calling external Symbiota2 API
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),

    // 2. JwtModule for signing tokens
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'hard!to-guess_secret', // configure via env
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
