/*
 * File: index.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:05 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Wednesday, 17th April 2019 11:43:49 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { XyoArchivistSqlRepository } from "./xyo-sql-archivist-repository"
import { IXyoSerializationService } from "@xyo-network/serialization"
import { SqlService } from "./sql-service"
import { ISqlArchivistRepositoryConfig } from './@types'
import path from 'path'

export async function createArchivistSqlRepository(
  config: ISqlArchivistRepositoryConfig,
  serializationService: any
) {
  const sqlService = await SqlService.tryCreateSqlService(
    config,
    path.join(__dirname, '..', 'resources', 'schema.sql')
  )

  const repo = new XyoArchivistSqlRepository(sqlService, serializationService as IXyoSerializationService)
  return repo
}

export { ISqlArchivistRepositoryConfig } from './@types'
