import { HttpStatus, Injectable } from '@nestjs/common';
import type { User } from '@formlyst/types';
import { generateResponse } from './common/responses/generate-response.js';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getUser(): User {
    return {
      id: '1',
      name: 'Ada Lovelace',
      email: 'ada@formlyst.dev',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  greet(name: string) {
    return generateResponse({
      statusCode: HttpStatus.OK,
      message: `Greeting generated for ${name}`,
      data: { greeting: `Hello, ${name}!` },
    });
  }
}
