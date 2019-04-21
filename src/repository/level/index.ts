/*
 * File: index.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:05 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Tuesday, 16th April 2019 6:07:42 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { XyoArchivistLevelRepository } from './xyo-level-archivist-repository'
import { IXyoSerializationService } from '@xyo-network/serialization'
import path from 'path'

export async function createArchivistLevelRepository(
  serializationService: IXyoSerializationService
) {
  const repo = new XyoArchivistLevelRepository(serializationService)
  return repo
}

export { ILevelArchivistRepositoryConfig } from './@types'
