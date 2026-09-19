import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { SessionMeta } from '../services/session-store.service.js';

function parseDeviceLabel(userAgent: string): string {
  if (!userAgent) return 'Unknown device';

  const os = /windows/i.test(userAgent)
    ? 'Windows'
    : /mac os/i.test(userAgent)
      ? 'macOS'
      : /android/i.test(userAgent)
        ? 'Android'
        : /iphone|ipad/i.test(userAgent)
          ? 'iOS'
          : /linux/i.test(userAgent)
            ? 'Linux'
            : 'Unknown OS';

  const browser = /edg\//i.test(userAgent)
    ? 'Edge'
    : /chrome/i.test(userAgent)
      ? 'Chrome'
      : /firefox/i.test(userAgent)
        ? 'Firefox'
        : /safari/i.test(userAgent)
          ? 'Safari'
          : 'Unknown browser';

  return `${browser} on ${os}`;
}

export const ClientInfo = createParamDecorator(
  (_data: unknown, context: ExecutionContext): SessionMeta => {
    const request = context.switchToHttp().getRequest<Request>();
    const userAgent = request.headers['user-agent'] ?? '';
    return {
      ip: request.ip ?? 'unknown',
      userAgent,
      deviceLabel: parseDeviceLabel(userAgent),
    };
  },
);
