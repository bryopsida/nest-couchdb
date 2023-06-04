import { ServerScope } from 'nano'
import 'reflect-metadata';

import {
  CouchDbConnectionFactory,
  CouchDbRepositoryFactory,
} from '../../src/couchdb'
import { CouchDbException } from '../../src/couchdb/exceptions'
import { config, Cat } from '../__stubs__'
import { deleteDb } from '../helpers'
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'

describe('#couchdb', () => {
  describe('#CouchDbRepositoryFactory', () => {
    const dbName = 'cats'
    const dbName2 = 'invalid'
    let connection: ServerScope
    let repoFactory: CouchDbRepositoryFactory

    beforeAll(async () => {
      connection = await CouchDbConnectionFactory.create(config)
      repoFactory = CouchDbRepositoryFactory.create(connection, config)
      await Promise.all([
        deleteDb(connection, dbName),
        deleteDb(connection, dbName2),
      ])
    })

    afterAll(async () => {
      await Promise.all([
        deleteDb(connection, dbName),
        deleteDb(connection, dbName2),
      ])
    })

    describe('#static create', () => {
      it('should create an instance', () => {
        expect(
          CouchDbRepositoryFactory.create({} as any, {} as any)
        ).toBeInstanceOf(CouchDbRepositoryFactory)
      })
    })

    describe('#getDbName', () => {
      it('should throw an error', () => {
        expect(
          (repoFactory as any).getDbName.bind(repoFactory, {})
        ).toThrowError(CouchDbException)
      })
      it('should return dbName', () => {
        expect((repoFactory as any).getDbName(Cat)).toBe(dbName)
      })
    })

    describe('#createDatabase', () => {
      it('should return true', async () => {
        const [_, ok] = await (repoFactory as any).createDatabase(dbName)
        expect(ok).toBe(true)
      })
    })

    describe('#checkDatabase', () => {
      it('it should return true', async () => {
        const [_, ok] = await (repoFactory as any).checkDatabase(dbName)
        expect(ok).toBe(true)
      })
      it('should throw an error', async () => {
        const [err] = await (repoFactory as any).checkDatabase(dbName2)
        expect(err).toBeInstanceOf(Error)
      })
      it('should create database', async () => {
        const repoFactory2 = CouchDbRepositoryFactory.create(connection, {
          ...config,
          sync: true,
        })
        const [_, ok] = await (repoFactory2 as any).checkDatabase(dbName2)
        expect(ok).toBe(true)
      })
    })

    describe('#create', () => {
      it('should create repository', async () => {
        const repo = await repoFactory.create<any>(Cat)
        expect(repo).toBeDefined()
        expect(repo).toHaveProperty('entity')
      })
    })
  })
})
