import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import type { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { UserEntity } from '../entities/user.entity.js';

@Injectable()
export class UserRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {}

  findById(id: string): Promise<UserEntity | null> {
    return this.txHost.tx
      .getRepository(UserEntity)
      .findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<UserEntity | null> {
    return this.txHost.tx
      .getRepository(UserEntity)
      .findOne({ where: { email } });
  }

  save(user: Partial<UserEntity>): Promise<UserEntity> {
    return this.txHost.tx.getRepository(UserEntity).save(user);
  }
}
