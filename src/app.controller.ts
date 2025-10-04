import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import type { Request as ExpressRequest } from 'express';
import { JwtGuard } from './auth/guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(JwtGuard)
  @Get('me')
  getMe(@Req() req: ExpressRequest ) {
    return req.user;
  }
}
