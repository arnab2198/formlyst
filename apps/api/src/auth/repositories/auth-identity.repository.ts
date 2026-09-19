import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import type { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { AuthIdentityEntity } from '../entities/auth-identity.entity.js';
import { AuthProvider } from '../enums/auth-provider.enum.js';

@Injectable()
export class AuthIdentityRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {}

  findByProvider(
    provider: AuthProvider,
    providerUserId: string,
  ): Promise<AuthIdentityEntity | null> {
    return this.txHost.tx
      .getRepository(AuthIdentityEntity)
      .findOne({ where: { provider, providerUserId } });
  }

  findAllByUser(userId: string): Promise<AuthIdentityEntity[]> {
    return this.txHost.tx
      .getRepository(AuthIdentityEntity)
      .find({ where: { userId } });
  }

  save(
    identity: Partial<AuthIdentityEntity>,
  ): Promise<AuthIdentityEntity> {
    return this.txHost.tx.getRepository(AuthIdentityEntity).save(identity);
  }
}
