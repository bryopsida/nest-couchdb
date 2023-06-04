import * as nano from 'nano';

import { CouchDbConnectionConfig, Repository } from './interfaces';
import { CouchDbException } from './exceptions';
import { CouchDbRepositoryMixin } from './couchdb.repository.mixin';
import { getEntityMetadata } from './couchdb.utils';

export class CouchDbRepositoryFactory {
  private readonly connection: nano.ServerScope;
  private readonly config: CouchDbConnectionConfig;

  constructor(connection: nano.ServerScope, config: CouchDbConnectionConfig) {
    this.config = config;
    this.connection = connection;
  }

  static create(
    connection: nano.ServerScope,
    config: CouchDbConnectionConfig,
  ): CouchDbRepositoryFactory {
    return new CouchDbRepositoryFactory(connection, config);
  }

  async create<T>(entity: T): Promise<Repository<T>> {
    const dbName = this.getDbName(entity);
    await this.checkDatabase(dbName);
    const driver = this.connection.use<T>(dbName);

    return new (CouchDbRepositoryMixin<T>(driver, entity))();
  }

  private getDbName(entity: any): string {
    const dbName = getEntityMetadata(entity);

    if (!dbName) {
      throw new CouchDbException('Invalid database name in @Entity decorator');
    }
    return dbName;
  }

  private async checkDatabase(dbName: string): Promise<boolean> {
    try {
      await this.connection.db.get(dbName);
      return true;
    } catch (error) {
      if (this.config.sync) {
        return this.createDatabase(dbName);
      }
      throw error;
    }
  }

  private async createDatabase(dbName: string): Promise<boolean> {
    await this.connection.db.create(dbName);
    return true;
  }
}
