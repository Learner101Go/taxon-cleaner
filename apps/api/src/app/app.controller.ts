import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Redis } from 'ioredis';
import { QueueService } from '../queue/queue.service';

@Controller()
export class AppController {
  private readonly redisClient: Redis;
  constructor(
    private readonly appService: AppService,
    private queueService: QueueService
  ) {
    this.redisClient = new Redis({
      host: 'localhost',
      port: 6379,
    });
  }

  @Get()
  getData() {
    return this.appService.getData();
  }

  // @Get('health')
  // healthCheck() {
  //   return {
  //     status: 'ok',
  //     redis: this.redisClient.status === 'ready' ? 'connected' : 'disconnected',
  //     queue: this.queueService.getQueueStatus(),
  //   };
  // }
}
