/*
 * File: index.ts
 * Project: @xyo-network/sdk-archivist-nodejs
 * File Created: Wednesday, 17th April 2019 2:51:11 pm
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Monday, 22nd April 2019 10:10:13 am
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { XyoNode } from './base-node'
import { DEFAULT_NODE_OPTIONS_MYSQL, DEFAULT_NODE_OPTIONS_DYNAMODB, DEFAULT_NODE_OPTIONS } from './base-node/default-node-options'

export { IXyoArchivistNetwork, XyoArchivistNetwork, CatalogueItem } from './network/'
export { createArchivistDynamoDBRepository, IDynamoDBArchivistRepositoryConfig } from './repository/dynamodb'
export { createArchivistLevelDBRepository, ILevelDBArchivistRepositoryConfig } from './repository/leveldb '
export { createArchivistNeo4jRepository, INeo4jArchivistRepositoryConfig } from './repository/neo4j'
export { createArchivistSqlRepository, ISqlArchivistRepositoryConfig } from './repository/sql'
export {
  IXyoArchivistRepository,
  IXyoEntitiesList,
  IXyoEntity,
  IXyoEntityType,
  IXyoOriginBlockResult,
  IXyoOriginBlocksByPublicKeyResult,
  IXyoIntersectionsList,
  IArchivistRepositoryConfig
} from './repository'
export { IXyoComponentArchivistFeatureDetail } from './@types'
export { XyoNode } from './base-node'

// function to launch for testing.  Should never be used in production
async function main() {
  let node
  const db = process.argv.length > 2 ? process.argv[2] : 'unknown'
  switch (db) {
    case 'mysql': {
      node = new XyoNode(DEFAULT_NODE_OPTIONS_MYSQL)
      break
    }
    case 'dynamodb': {
      node = new XyoNode(DEFAULT_NODE_OPTIONS_DYNAMODB)
      break
    }
    default: {
      node = new XyoNode(DEFAULT_NODE_OPTIONS)
      break
    }
  }
  await node.initialize()
  await node.start()
}

if (require.main === module) {
  main()
}
