import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuthProvider } from '../enums/auth-provider.enum.js';
import { UserEntity } from './user.entity.js';

@Entity('auth_identities')
@Index(['provider', 'providerUserId'], { unique: true })
@Index(['provider', 'userId'], { unique: true })
export class AuthIdentityEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'enum', enum: AuthProvider })
  provider: AuthProvider;

  @Column({ name: 'provider_user_id' })
  providerUserId: string;

  @Column({ name: 'provider_email' })
  providerEmail: string;

  @CreateDateColumn({ name: 'linked_at' })
  linkedAt: Date;
}
