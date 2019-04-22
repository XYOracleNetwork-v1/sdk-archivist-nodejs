/*
 * File: index.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:05 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Monday, 22nd April 2019 8:30:50 am
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { XyoArchivistNeo4jRepository } from './xyo-neo4j-archivist-repository'
import { IXyoSerializationService } from '@xyo-network/serialization'
import { INeo4jArchivistRepositoryConfig } from './@types'

export async function createArchivistNeo4jRepository(
  config: INeo4jArchivistRepositoryConfig,
  serializationService: IXyoSerializationService
) {
  const repo = new XyoArchivistNeo4jRepository(serializationService)
  return repo
}

export { INeo4jArchivistRepositoryConfig } from './@types'
