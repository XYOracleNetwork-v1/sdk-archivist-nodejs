/*
 * File: index.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:05 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Wednesday, 24th April 2019 10:18:31 am
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { XyoArchivistLevelRepository } from './xyo-level-archivist-repository'
import { ILevelDBArchivistRepositoryConfig } from './@types'

export async function createArchivistLevelDBRepository(
  config: ILevelDBArchivistRepositoryConfig
) {
  const repo = new XyoArchivistLevelRepository()
  return repo
}

export { ILevelDBArchivistRepositoryConfig } from './@types'
