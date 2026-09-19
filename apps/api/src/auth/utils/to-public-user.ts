import type { User } from '@formlyst/types';
import type { UserEntity } from '../entities/user.entity.js';

export function toPublicUser(user: UserEntity): User {
  return {
    id: user.id,
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
