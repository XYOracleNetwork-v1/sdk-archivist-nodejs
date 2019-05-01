/*
 * File: index.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 1:46:59 pm
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Tuesday, 30th April 2019 9:47:42 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { IXyoOriginBlockRepository } from '@xyo-network/sdk-core-nodejs'

export interface IXyoArchivistRepository extends IXyoOriginBlockRepository {

  initialize(): Promise<boolean>

  getOriginBlocksByPublicKey(publicKey: Buffer): Promise<{items: Buffer[], total: number}>

  getEntities(limit: number, cursor: Buffer | undefined): Promise<{items: Buffer[], total: number}>
}

export interface IXyoIntersectionsList {
  totalSize: number
  hasNextPage: boolean
  list: string[]
  cursor: string | undefined
}

export interface IXyoEntityType {
  sentinel: boolean
  bridge: boolean
  archivist: boolean
  diviner: boolean
}

export interface IXyoEntity {
  firstKnownPublicKey: Buffer
  allPublicKeys?: Buffer[]
  type: IXyoEntityType
  mostRecentIndex?: number
}
export interface IXyoConfig {
  name: string
}
export interface IXyoEntitiesList {
  totalSize: number
  hasNextPage: boolean
  list: IXyoEntity[]
  cursor: string | undefined
}

export interface IXyoOriginBlockResult {
  publicKeys: Buffer[]
}

export interface IXyoOriginBlocksByPublicKeyResult {
  publicKeys: Buffer[]
  boundWitnesses: Buffer[]
}

export interface IArchivistRepositoryConfig extends IXyoConfig {
  platform: string /* mysql, level, neo4j, dynamo etc... */
}
