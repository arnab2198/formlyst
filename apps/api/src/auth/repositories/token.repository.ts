import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import type { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { IsNull, MoreThan } from 'typeorm';
import { TokenEntity } from '../entities/token.entity.js';
import { TokenType } from '../enums/token-type.enum.js';

@Injectable()
export class TokenRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {}

  findActive(userId: string, type: TokenType): Promise<TokenEntity | null> {
    return this.txHost.tx.getRepository(TokenEntity).findOne({
      where: {
        userId,
        type,
        usedAt: IsNull(),
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
    });
  }

  async revokeAllActive(userId: string, type: TokenType): Promise<void> {
    await this.txHost.tx.getRepository(TokenEntity).update(
      { userId, type, usedAt: IsNull(), revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  findActiveByHash(
    type: TokenType,
    tokenHash: string,
  ): Promise<TokenEntity | null> {
    return this.txHost.tx.getRepository(TokenEntity).findOne({
      where: {
        type,
        tokenHash,
        usedAt: IsNull(),
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
    });
  }

  save(token: Partial<TokenEntity>): Promise<TokenEntity> {
    return this.txHost.tx.getRepository(TokenEntity).save(token);
  }

  async markUsed(id: string): Promise<void> {
    await this.txHost.tx
      .getRepository(TokenEntity)
      .update(id, { usedAt: new Date() });
  }

  async incrementAttempts(id: string, attempts: number): Promise<void> {
    await this.txHost.tx
      .getRepository(TokenEntity)
      .update(id, { metadata: { attempts } });
  }

  async revoke(id: string): Promise<void> {
    await this.txHost.tx
      .getRepository(TokenEntity)
      .update(id, { revokedAt: new Date() });
  }
}
