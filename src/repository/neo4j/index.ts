/*
 * File: index.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:05 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Friday, 13th November 2020 2:50:39 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { INeo4jArchivistRepositoryConfig } from './@types'
import { XyoArchivistNeo4jRepository } from './xyo-neo4j-archivist-repository'

const createArchivistNeo4jRepository = (
  _config: INeo4jArchivistRepositoryConfig
) => {
  const repo = new XyoArchivistNeo4jRepository()
  return repo
}

export type { INeo4jArchivistRepositoryConfig } from './@types'

export { createArchivistNeo4jRepository }
