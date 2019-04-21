/*
 * File: index.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:05 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Tuesday, 16th April 2019 6:08:02 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { XyoArchivistNeo4jRepository } from './xyo-neo4j-archivist-repository'
import { IXyoSerializationService } from '@xyo-network/serialization'
import path from 'path'

export async function createArchivistNeo4jRepository(
  serializationService: IXyoSerializationService
) {
  const repo = new XyoArchivistNeo4jRepository(serializationService)
  return repo
}

export { INeo4jArchivistRepositoryConfig } from './@types'
