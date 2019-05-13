/*
 * File: xyo-dynamo-archivist-repository.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 2:04:07 pm
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Tuesday, 30th April 2019 10:08:59 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { XyoBase } from '@xyo-network/sdk-base-nodejs'
import { BoundWitnessTable } from './table/boundwitness'
import { PublicKeyTable } from './table/publickey'
import { XyoIterableStructure } from '@xyo-network/object-model'
import { IXyoOriginBlockGetter, IXyoOriginBlockRepository, XyoBoundWitness, IXyoBlockByPublicKeyRepository, XyoBoundWitnessOriginGetter } from '@xyo-network/sdk-core-nodejs'
import crypto from 'crypto'

// Note: We use Sha1 hashes in DynamoDB to save space!  All functions calling to the tables
// must use shortHashes (sha1)

export class XyoArchivistDynamoRepository extends XyoBase implements IXyoOriginBlockGetter, IXyoOriginBlockRepository, IXyoBlockByPublicKeyRepository {
  private maxNumberOfBlockResults = 10_000
  private boundWitnessTable: BoundWitnessTable
  private publicKeyTable: PublicKeyTable

  constructor(
    tablePrefix: string = 'xyo-archivist',
    region: string = 'us-east-1'
  ) {
    super()
    this.boundWitnessTable = new BoundWitnessTable(`${tablePrefix}-boundwitness`, region)
    this.publicKeyTable = new PublicKeyTable(`${tablePrefix}-chains`, region)

  }

  public async initialize() {
    this.boundWitnessTable.initialize()
    this.publicKeyTable.initialize()
    return true
  }

  public async getOriginBlocksByPublicKey(publicKey: Buffer, index: number | undefined, limit: number | undefined, up: boolean) {
    if ((limit || 100) > this.maxNumberOfBlockResults) {
      throw new Error('Max number of blocks reached')
    }

    const shortKey = this.sha1(publicKey)
    const scanResult = await this.publicKeyTable.scanByKey(shortKey, limit || 100, index || 0, up)

    const result: Buffer[] = []
    for (const hash of scanResult.items) {
      const data = await this.boundWitnessTable.getItem(hash)
      result.push(data)
    }
    return { items: result, total:scanResult.total }
  }

  public async removeOriginBlock(hash: Buffer): Promise<void> {
    const shortHash = this.sha1(hash)
    return this.boundWitnessTable.deleteItem(shortHash)
  }

  public async addOriginBlock(hash: Buffer, originBlock: Buffer): Promise<void> {
    try {
      const shortHash = this.sha1(hash)

      const bw = new XyoBoundWitness(originBlock)
      const publicKeys = bw.getPublicKeys()
      const origins = XyoBoundWitnessOriginGetter.getOriginInformation(bw)

      for (let i = 0; i < origins.length; i++) {
        const pks = publicKeys[i]
        const origin = origins[i]

        for (const pk of pks) {
          const shortKey = this.sha1(pk.getAll().getContentsCopy())
          await this.publicKeyTable.putItem(shortKey, shortHash, origin.index)
        }
      }

      return await this.boundWitnessTable.putItem(shortHash, originBlock)
    } catch (ex) {
      this.logError(ex)
      throw ex
    }
  }

  public async addOriginBlockPublicKeys(hash: Buffer, originBlock: Buffer): Promise<void> {
    try {
      const shortHash = this.sha1(hash)

      const bw = new XyoBoundWitness(originBlock)
      const publicKeys = bw.getPublicKeys()
      const origins = XyoBoundWitnessOriginGetter.getOriginInformation(bw)

      for (let i = 0; i < origins.length; i++) {
        const pks = publicKeys[i]
        const origin = origins[i]

        for (const pk of pks) {
          const shortKey = this.sha1(pk.getAll().getContentsCopy())
          await this.publicKeyTable.putItem(shortKey, shortHash, origin.index)
        }
      }

    } catch (ex) {
      this.logError(ex)
      throw ex
    }
  }

  public async addOriginBlocks(hashes: Buffer, blocks: Buffer): Promise<void> {
    const blockStructure = new XyoIterableStructure(blocks)
    const hashesStructure = new XyoIterableStructure(hashes)
    const blockIt = blockStructure.newIterator()
    const hashIt = hashesStructure.newIterator()
    let i = 0

    while (blockIt.hasNext()) {
      i++
      const block = blockIt.next().value
      const hash = hashIt.next().value
      await this.addOriginBlock(hash.getAll().getContentsCopy(), block.getAll().getContentsCopy())
    }
  }

  public async getOriginBlock(hash: Buffer): Promise < Buffer | undefined > {
    const shortHash = this.sha1(hash)
    const data = await this.boundWitnessTable.getItem(shortHash)
    if (data) {
      return data
    }
  }

  public async getOriginBlocks(limit: number, offsetHash ?: Buffer | undefined): Promise < {items: Buffer[], total: number} > {
    const shortOffsetHash = offsetHash ? this.sha1(offsetHash) : undefined
    const items = await this.boundWitnessTable.scan(limit, shortOffsetHash)
    const result: Buffer[] = []

    for (const item of items) {
      result.push(item)
    }

    return { items: result, total: (await this.boundWitnessTable.getRecordCount()) || -1 }
  }

  private sha1(data: Buffer) {
    return crypto.createHash('sha1').update(data).digest()
  }
}
