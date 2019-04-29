/*
 * File: index.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:05 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Thursday, 25th April 2019 12:57:12 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { IArchivistRepositoryConfig } from './@types'
import { createArchivistSqlRepository, ISqlArchivistRepositoryConfig } from './sql'
import { createArchivistLevelDBRepository, ILevelDBArchivistRepositoryConfig } from './leveldb'
import { createArchivistDynamoDBRepository, IDynamoDBArchivistRepositoryConfig } from './dynamodb'
import { createArchivistNeo4jRepository, INeo4jArchivistRepositoryConfig } from './neo4j'

export async function createArchivistRepository(
  config: IArchivistRepositoryConfig,
  serializationService: any
) {
  switch (config.platform) {
    case 'mysql': {
      return createArchivistSqlRepository(config as ISqlArchivistRepositoryConfig)
    }
    case 'dynamodb': {
      return createArchivistDynamoDBRepository(config as IDynamoDBArchivistRepositoryConfig)
    }
    case 'leveldb': {
      return createArchivistLevelDBRepository(config as ILevelDBArchivistRepositoryConfig)
    }
    case 'neo4j': {
      return createArchivistNeo4jRepository(config as INeo4jArchivistRepositoryConfig)
    }
  }
}

export { createArchivistLevelDBRepository, ILevelDBArchivistRepositoryConfig } from './leveldb'
export { createArchivistNeo4jRepository, INeo4jArchivistRepositoryConfig } from './neo4j'
export { createArchivistSqlRepository, ISqlArchivistRepositoryConfig } from './sql'

export {
  IXyoArchivistRepository,
  IXyoEntitiesList,
  IXyoEntity,
  IXyoEntityType,
  IXyoOriginBlockResult,
  IXyoOriginBlocksByPublicKeyResult,
  IXyoIntersectionsList,
  IArchivistRepositoryConfig
} from './@types'
