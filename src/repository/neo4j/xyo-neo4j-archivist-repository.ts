/*
 * File: xyo-neo4j-archivist-repository.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:05 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Wednesday, 24th April 2019 10:43:58 am
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import {
  IXyoArchivistRepository,
  IXyoOriginBlocksByPublicKeyResult,
  IXyoEntitiesList,
  IXyoIntersectionsList
} from '..'

import { XyoBase } from '@xyo-network/base'

import _ from 'lodash'

export class XyoArchivistNeo4jRepository extends XyoBase implements IXyoArchivistRepository {

  constructor(
  ) {
    super()
  }

  public async initialize() {
    return true
  }

  public async getOriginBlocksByPublicKey(publicKey: Buffer): Promise<Buffer[]> {
    return []
  }

  public async getEntities(limit: number, offsetCursor?: Buffer | undefined): Promise<Buffer[]> {
    return []
  }

  public async removeOriginBlock(hash: Buffer): Promise<void> {
    return
  }

  public async containsOriginBlock(hash: Buffer): Promise<boolean> {
    return false
  }

  public async getAllOriginBlockHashes(): Promise<Buffer[]> {
    return []
  }

  public async addOriginBlock(
    hash: Buffer,
    originBlock: Buffer
  ): Promise<void> {
    return
  }

  public async getOriginBlock(hash: Buffer): Promise<Buffer | undefined> {
    return undefined
  }

  public async getBlocksThatProviderAttribution(hash: Buffer): Promise<{[h: string]: Buffer}> {
    return {

    }
  }

  public async getOriginBlocks(limit: number, offsetHash?: Buffer | undefined): Promise<Buffer[]> {
    return []
  }
}
