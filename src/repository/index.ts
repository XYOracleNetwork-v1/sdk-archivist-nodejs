/*
 * File: index.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:05 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Monday, 22nd April 2019 8:29:11 am
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { IArchivistRepositoryConfig } from './@types'
import { createArchivistSqlRepository, ISqlArchivistRepositoryConfig } from './sql'
import { createArchivistLevelDBRepository, ILevelDBArchivistRepositoryConfig } from './leveldb '
import { createArchivistDynamoDBRepository, IDynamoDBArchivistRepositoryConfig } from './dynamodb'
import { createArchivistNeo4jRepository, INeo4jArchivistRepositoryConfig } from './neo4j'

export async function createArchivistRepository(
  config: IArchivistRepositoryConfig,
  serializationService: any
) {
  switch (config.platform) {
    case 'mysql': {
      return createArchivistSqlRepository(config as ISqlArchivistRepositoryConfig, serializationService)
    }
    case 'dynamodb': {
      return createArchivistDynamoDBRepository(config as IDynamoDBArchivistRepositoryConfig, serializationService)
    }
    case 'leveldb': {
      return createArchivistLevelDBRepository(config as ILevelDBArchivistRepositoryConfig, serializationService)
    }
    case 'neo4j': {
      return createArchivistNeo4jRepository(config as INeo4jArchivistRepositoryConfig, serializationService)
    }
  }
}

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
