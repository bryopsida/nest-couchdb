# NestJS CouchDB
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=bryopsida_nest-couchdb&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=bryopsida_nest-couchdb) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=bryopsida_nest-couchdb&metric=coverage)](https://sonarcloud.io/summary/new_code?id=bryopsida_nest-couchdb) [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=bryopsida_nest-couchdb&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=bryopsida_nest-couchdb) [![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=bryopsida_nest-couchdb&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=bryopsida_nest-couchdb) [![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=bryopsida_nest-couchdb&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=bryopsida_nest-couchdb) [![Bugs](https://sonarcloud.io/api/project_badges/measure?project=bryopsida_nest-couchdb&metric=bugs)](https://sonarcloud.io/summary/new_code?id=bryopsida_nest-couchdb)


A <a href="http://couchdb.apache.org/">CouchDB</a> module for <a href="https://nestjs.com/">NestJS</a>


## Installation

```bash
$ npm i @bryopsida/nest-couchdb nano
```

## Usage

`@bryopsida/nest-couchdb` uses [nano](https://www.npmjs.com/package/nano) as a data provider for CouchDB and the `Repository` pattern to handle all documents related operations.

First, let's create an `Entity`:

```typescript
import { Entity, CouchDbEntity } from '@bryopsida/nest-couchdb'

@Entity('cats')
export class Cat extends CouchDbEntity {
  name: string
}
```

Where `cats` is the CouchDB database name.

The `CouchDbEntity` is a base class which has some common properties:

```typescript
class CouchDbEntity {
  _id: string
  _rev: string
}
```

Then, we need to import `CouchDbModule` in our `ApplicationModule`:

```typescript
import { Module } from '@nestjs/common'
import { CouchDbModule } from '@bryopsida/nest-couchdb'

@Module({
  imports: [
    CouchDbModule.forRoot({
      url: 'http://localhost:5984',
      username: 'couchdb',
      userpass: 'password',
      requestDefaults: { jar: true },
    }),
  ],
})
export class ApplicationModule {}
```

In our `CatsModule` we need to initiate repository for our `Cat` entity:

```typescript
import { Module } from '@nestjs/common'
import { CouchDbModule } from '@bryopsida/nest-couchdb'
import { CatsService } from './cats.service'
import { CatsController } from './cats.controller'
import { Cat } from './cat.entity'

@Module({
  imports: [CouchDbModule.forFeature([Cat])],
  providers: [CatsService],
  controllers: [CatsController],
})
export class CatsModule {}
```

And here is the usage of the repository in the service:

```typescript
import { DocumentListResponse } from 'nano';
import { Injectable } from '@nestjs/common';
import { InjectRepository, Repository } from '@bryopsida/nest-couchdb';
import { Cat } from './cat.entity';

@Injectable()
export class CatsService {
  constructor(
    @InjectRepository(Cat)
    private readonly catsRepository: Repository<Cat>,
  ) {}

  findAll(): Promise<DocumentListResponse<Cat> {
    return this.catsRepository.list();
  }
}
```

## Test

```bash
$ docker-compose up -d
$ npm test
```

## License

[MIT](LICENSE)

## Credits

Created by [@zMotivat0r](https://github.com/zMotivat0r) @ [Scalio](https://scal.io/)
