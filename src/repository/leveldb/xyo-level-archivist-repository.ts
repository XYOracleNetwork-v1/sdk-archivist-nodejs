/*
 * File: xyo-level-archivist-repository.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:05 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Thursday, 25th April 2019 3:22:06 pm
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

import levelup, { LevelUp } from 'levelup'
import leveldown from 'leveldown'
import { AbstractIteratorOptions } from 'abstract-leveldown'

export class XyoArchivistLevelRepository extends XyoBase implements IXyoArchivistRepository {

  private db: LevelUp

  constructor(
  ) {
    super()
    this.db = levelup(leveldown('./xyo-blocks'))
  }

  public async initialize() {
    return true
  }

  public async getOriginBlocksByPublicKey(publicKey: Buffer): Promise<{items: Buffer[], total: number}> {
    this.logError('getEntities: Not Implemented')
    return { items: [], total: 0 }
  }

  public async removeOriginBlock(hash: Buffer): Promise<void> {
    return
  }

  public async containsOriginBlock(hash: Buffer): Promise<boolean> {
    return false
  }

  public async getEntities(limit: number, offsetCursor?: Buffer | undefined): Promise<{items: Buffer[], total: number}> {
    this.logError('getEntities: Not Implemented')
    return { items: [], total: 0 }
  }

  public async getAllOriginBlockHashes(): Promise<Buffer[]> {
    return []
  }

  public async addOriginBlock(
    hash: Buffer,
    originBlock: Buffer
  ): Promise<void> {
    return this.db.put(hash, originBlock)
  }

  public async addOriginBlocks(hashes: Buffer, blocks: Buffer): Promise<void> {
    return
  }

  public async getOriginBlock(hash: Buffer): Promise<Buffer | undefined> {
    return this.db.get(hash)
  }

  public async getBlocksThatProviderAttribution(hash: Buffer): Promise<{[h: string]: Buffer}> {
    return {

    }
  }

  public async getOriginBlocks(limit: number, offsetHash?: Buffer | undefined): Promise<{items: Buffer[], total: number}> {
    const options: AbstractIteratorOptions = {
      limit
    }

    if (offsetHash) {
      options.gt = offsetHash
    }

    const blocks: Buffer[] = []

    await this.db.createReadStream(options
      ).on('data', (data: any) => {
        blocks.push(data.value)
      }).on('error', (err: any) => {
        throw(err)
      }).on('close', () => {
        console.log('Stream closed')
      }).on('end', () => {
        console.log('Stream ended')
      })
    return { items: [], total: 0 }
  }
}
