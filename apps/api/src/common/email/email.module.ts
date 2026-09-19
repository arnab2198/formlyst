import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module.js';
import { ConfigService } from '../../config/config.service.js';
import { ConsoleEmailService } from './console-email.service.js';
import { EMAIL_SERVICE } from './email.interface.js';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    ConsoleEmailService,
    {
      provide: EMAIL_SERVICE,
      inject: [ConfigService, ConsoleEmailService],
      useFactory: (
        configService: ConfigService,
        consoleEmail: ConsoleEmailService,
      ) => {
        switch (configService.auth.emailProvider) {
          case 'console':
          default:
            return consoleEmail;
        }
      },
    },
  ],
  exports: [EMAIL_SERVICE],
})
export class EmailModule {}
