import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateAuthIdentitiesTable1789822317358 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'auth_identities',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'provider',
            type: 'enum',
            enum: ['GOOGLE'],
          },
          {
            name: 'provider_user_id',
            type: 'varchar',
          },
          {
            name: 'provider_email',
            type: 'varchar',
          },
          {
            name: 'linked_at',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
        indices: [
          {
            name: 'IDX_auth_identities_provider_provider_user_id',
            columnNames: ['provider', 'provider_user_id'],
            isUnique: true,
          },
          {
            name: 'IDX_auth_identities_provider_user_id',
            columnNames: ['provider', 'user_id'],
            isUnique: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'auth_identities',
      new TableForeignKey({
        name: 'FK_auth_identities_user_id',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('auth_identities');
  }
}
