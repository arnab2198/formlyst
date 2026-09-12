import { Injectable } from '@nestjs/common';
import type { User } from '@formlyst/types';

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
}
