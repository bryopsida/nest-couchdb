import { ServerScope } from 'nano'
import 'reflect-metadata'

import {
  CouchDbConnectionFactory,
  CouchDbRepositoryFactory,
} from '../../src/couchdb'
import { CouchDbException } from '../../src/couchdb/exceptions'
import { getConfig, Cat } from '../__stubs__'
import { deleteDb } from '../helpers'
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { StartedTestContainer, GenericContainer } from 'testcontainers'

describe('#couchdb', () => {
  let container: StartedTestContainer
  let config: any
  beforeAll(async () => {
    container = await new GenericContainer('couchdb')
      .withEnvironment({
        COUCHDB_PASSWORD:
          '-pbkdf2-847043acc65626c8eb98da6d78682fbc493a1787,f7b1a3e4b624f4f0bbfe87e96841eda0,10',
        COUCHDB_SECRET: '0123456789abcdef0123456789abcdef',
        COUCHDB_USER: 'couchdb',
        NODENAME: 'couchdb-0.docker.com',
      })
      .withNetworkAliases('couchdb-0.docker.com')
      .withExposedPorts(5984)
      .start()
    config = getConfig(`http://localhost:${container.getFirstMappedPort()}`)
  })
  afterAll(async () => {
    await container.stop()
  })
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
        const ok = await (repoFactory as any).createDatabase(dbName)
        expect(ok).toBe(true)
      })
    })

    describe('#checkDatabase', () => {
      it('it should return true', async () => {
        const ok = await (repoFactory as any).checkDatabase(dbName)
        expect(ok).toBe(true)
      })
      it('should throw an error', async () => {
        expect(() => {
          return (repoFactory as any).checkDatabase(dbName2)
        }).rejects.toBeInstanceOf(Error)
      })
      it('should create database', async () => {
        const repoFactory2 = CouchDbRepositoryFactory.create(connection, {
          ...config,
          sync: true,
        })
        const ok = await (repoFactory2 as any).checkDatabase(dbName2)
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
