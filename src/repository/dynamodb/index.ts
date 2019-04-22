/*
 * File: index.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:05 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Monday, 22nd April 2019 8:28:42 am
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { XyoArchivistDynamoRepository } from './xyo-dynamo-archivist-repository'
import { IXyoSerializationService } from '@xyo-network/serialization'
import { IDynamoDBArchivistRepositoryConfig } from './@types'

export async function createArchivistDynamoDBRepository(
  config: IDynamoDBArchivistRepositoryConfig,
  serializationService: IXyoSerializationService
) {
  const repo = new XyoArchivistDynamoRepository(serializationService, config.tableName)
  return repo
}

export { IDynamoDBArchivistRepositoryConfig } from './@types'
