import { SetMetadata } from '@nestjs/common';

export const SKIP_INTERNAL_KEY_CHECK = Symbol('SKIP_INTERNAL_KEY_CHECK');

/** Exempts a route from the global `InternalApiKeyGuard` — see backend-auth-system.md §0. */
export const SkipInternalKeyCheck = () =>
  SetMetadata(SKIP_INTERNAL_KEY_CHECK, true);
