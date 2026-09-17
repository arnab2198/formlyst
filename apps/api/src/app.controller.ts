import { Controller, Get, Query } from '@nestjs/common';
import type { User } from '@formlyst/types';
import { z } from 'zod';
import { AppService } from './app.service.js';
import { Validate } from './common/decorators/validate.decorator.js';

const greetQuerySchema = z.object({
  name: z.string().min(1, 'name is required'),
});

type GreetQuery = z.infer<typeof greetQuerySchema>;

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('user')
  getUser(): User {
    return this.appService.getUser();
  }

  @Get('greet')
  @Validate({ source: 'query', schema: greetQuerySchema })
  greet(@Query() query: GreetQuery) {
    return this.appService.greet(query.name);
  }
}
