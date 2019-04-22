/*
 * File: index.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:05 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Monday, 22nd April 2019 8:30:39 am
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { XyoArchivistLevelRepository } from './xyo-level-archivist-repository'
import { IXyoSerializationService } from '@xyo-network/serialization'
import { ILevelDBArchivistRepositoryConfig } from './@types'

export async function createArchivistLevelDBRepository(
  config: ILevelDBArchivistRepositoryConfig,
  serializationService: IXyoSerializationService
) {
  const repo = new XyoArchivistLevelRepository(serializationService)
  return repo
}

export { ILevelDBArchivistRepositoryConfig } from './@types'
