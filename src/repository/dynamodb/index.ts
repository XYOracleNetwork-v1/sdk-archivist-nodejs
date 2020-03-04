/* eslint-disable @typescript-eslint/explicit-function-return-type */
/*
 * File: index.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:05 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Thursday, 25th April 2019 12:44:05 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { XyoArchivistDynamoRepository } from './xyo-dynamo-archivist-repository'
import { IDynamoDBArchivistRepositoryConfig } from './@types'

export async function createArchivistDynamoDBRepository(
  config: IDynamoDBArchivistRepositoryConfig
) {
  return new XyoArchivistDynamoRepository(config.tableName)
}

export { IDynamoDBArchivistRepositoryConfig } from './@types'
