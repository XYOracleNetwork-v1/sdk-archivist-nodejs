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

import { XyoBase } from '@xyo-network/sdk-base-nodejs'
import { IXyoOriginBlockGetter, IXyoOriginBlockRepository, XyoIterableStructure } from '@xyo-network/sdk-core-nodejs'
import { AbstractIteratorOptions } from 'abstract-leveldown'
import levelup, { LevelUp } from 'levelup'
import leveldown from 'leveldown'

export class XyoArchivistLevelRepository extends XyoBase implements IXyoOriginBlockGetter, IXyoOriginBlockRepository {

  private db: LevelUp

  constructor() {
    super()
    this.db = levelup(leveldown('./xyo-block-store'))
  }

  public async initialize() {
    return true
  }

  public async removeOriginBlock(hash: Buffer): Promise<void> {
    this.db.del(hash)
  }

  public async addOriginBlock(hash: Buffer, originBlock: Buffer): Promise<void> {
    return this.db.put(hash, originBlock)
  }

  public async addOriginBlocks(hashes: Buffer, blocks: Buffer): Promise<void> {
    const blockStructure = new XyoIterableStructure(blocks)
    const hashesStructure = new XyoIterableStructure(hashes)
    const blockIt = blockStructure.newIterator()
    const hashIt = hashesStructure.newIterator()

    while (blockIt.hasNext()) {
      const block = blockIt.next().value
      const hash = hashIt.next().value
      await this.addOriginBlock(hash.getAll().getContentsCopy(), block.getAll().getContentsCopy())
    }
  }

  public async getOriginBlock(hash: Buffer): Promise<Buffer | undefined> {
    return this.db.get(hash)
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

    return { items: blocks, total: blocks.length }
  }
}
