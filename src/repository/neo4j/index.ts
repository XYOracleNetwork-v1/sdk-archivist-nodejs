/*
 * File: index.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:05 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Thursday, 25th April 2019 12:41:30 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { XyoArchivistNeo4jRepository } from './xyo-neo4j-archivist-repository'
import { INeo4jArchivistRepositoryConfig } from './@types'

export async function createArchivistNeo4jRepository(
  config: INeo4jArchivistRepositoryConfig
) {
  const repo = new XyoArchivistNeo4jRepository()
  return repo
}

export { INeo4jArchivistRepositoryConfig } from './@types'
