/*
 * File: index.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:05 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Tuesday, 16th April 2019 6:07:22 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { XyoArchivistDynamoRepository } from './xyo-dynamo-archivist-repository'
import { IXyoSerializationService } from '@xyo-network/serialization'
import { IDynamoArchivistRepositoryConfig } from './@types'

export async function createArchivistDynamoRepository(
  config: IDynamoArchivistRepositoryConfig,
  serializationService: IXyoSerializationService
) {
  const repo = new XyoArchivistDynamoRepository(serializationService, config.tableName)
  return repo
}

export { IDynamoArchivistRepositoryConfig } from './@types'
