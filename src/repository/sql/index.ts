/*
 * File: index.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:05 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Thursday, 18th April 2019 5:09:40 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { XyoArchivistSqlRepository } from './xyo-sql-archivist-repository'
import { SqlService } from './sql-service'
import { ISqlArchivistRepositoryConfig } from './@types'
import path from 'path'

export async function createArchivistSqlRepository(
  config: ISqlArchivistRepositoryConfig,
  serializationService: any
) {
  const sqlService = await SqlService.tryCreateSqlService(
    config,
    path.join(__dirname, '..', 'sql', 'resources', 'schema.sql')
  )

  const repo = new XyoArchivistSqlRepository(sqlService)
  return repo
}

export { ISqlArchivistRepositoryConfig } from './@types'
