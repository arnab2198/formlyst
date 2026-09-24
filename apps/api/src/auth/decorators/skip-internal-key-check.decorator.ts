import { SetMetadata } from '@nestjs/common';

export const SKIP_INTERNAL_KEY_CHECK = Symbol('SKIP_INTERNAL_KEY_CHECK');

export const SkipInternalKeyCheck = () =>
  SetMetadata(SKIP_INTERNAL_KEY_CHECK, true);
