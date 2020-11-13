/* eslint-disable require-await */
/*
 * File: xyo-neo4j-archivist-repository.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:05 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Friday, 13th November 2020 2:48:01 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { XyoBase } from '@xyo-network/sdk-base-nodejs'
import {
  XyoOriginBlockGetter,
  XyoOriginBlockRepository,
} from '@xyo-network/sdk-core-nodejs'

export class XyoArchivistNeo4jRepository
  extends XyoBase
  implements XyoOriginBlockGetter, XyoOriginBlockRepository {
  constructor() {
    super()
  }

  public async initialize() {
    return true
  }

  public async getOriginBlocksByPublicKey(
    _publicKey: Buffer
  ): Promise<{ items: Buffer[]; total: number }> {
    return { items: [], total: 0 }
  }

  public async getEntities(
    _limit: number,
    _offsetCursor?: Buffer | undefined
  ): Promise<{ items: Buffer[]; total: number }> {
    return { items: [], total: 0 }
  }

  public async addOriginBlocks(
    _hashes: Buffer,
    _blocks: Buffer
  ): Promise<void> {
    return
  }

  public async removeOriginBlock(_hash: Buffer): Promise<void> {
    return
  }

  public async containsOriginBlock(_hash: Buffer): Promise<boolean> {
    return false
  }

  public async getAllOriginBlockHashes(): Promise<Buffer[]> {
    return []
  }

  public async addOriginBlock(
    _hash: Buffer,
    _originBlock: Buffer
  ): Promise<void> {
    return
  }

  public async getOriginBlock(_hash: Buffer): Promise<Buffer | undefined> {
    return undefined
  }

  public async traceChain(
    _publicKey: Buffer,
    _limit: number,
    _offsetHash: Buffer | undefined,
    _up: boolean
  ): Promise<Buffer[]> {
    return []
  }

  public async getBlocksThatProviderAttribution(
    _hash: Buffer
  ): Promise<{ [h: string]: Buffer }> {
    return {}
  }

  public async getOriginBlocks(
    _limit: number,
    _offsetHash?: Buffer | undefined
  ): Promise<{ items: Buffer[]; total: number }> {
    return { items: [], total: 0 }
  }
}
