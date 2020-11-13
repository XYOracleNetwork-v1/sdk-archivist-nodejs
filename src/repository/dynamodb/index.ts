/*
 * File: index.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:05 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Friday, 13th November 2020 3:01:15 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { IDynamoDBArchivistRepositoryConfig } from './@types'
import { XyoArchivistDynamoRepository } from './xyo-dynamo-archivist-repository'

const createArchivistDynamoDBRepository = (
  config: IDynamoDBArchivistRepositoryConfig
) => {
  return new XyoArchivistDynamoRepository(config.tableName)
}

export type { IDynamoDBArchivistRepositoryConfig } from './@types'

export { createArchivistDynamoDBRepository }
