/* eslint-disable require-await */
/*
 * File: xyo-dynamo-archivist-repository.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 2:04:07 pm
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Friday, 13th November 2020 2:57:03 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { XyoBase } from '@xyo-network/sdk-base-nodejs'
import {
  addAllDefaults,
  gpsResolver,
  XyoBlockByPublicKeyRepository,
  XyoBlocksByTime,
  XyoBoundWitness,
  XyoBoundWitnessOriginGetter,
  XyoIterableStructure,
  XyoObjectSchema,
  XyoOriginBlockGetter,
  XyoOriginBlockRepository,
} from '@xyo-network/sdk-core-nodejs'
import crypto from 'crypto'
import ngeohash from 'ngeohash'

import { BoundWitnessTable } from './table/boundwitness'
import { GeohashTable } from './table/geo'
import { PublicKeyTable } from './table/publickey'
import { TimeTable } from './table/time'

// Note: We use Sha1 hashes in DynamoDB to save space!  All functions calling to the tables
// must use shortHashes (sha1)

export class XyoArchivistDynamoRepository
  extends XyoBase
  implements
    XyoOriginBlockGetter,
    XyoOriginBlockRepository,
    XyoBlockByPublicKeyRepository,
    XyoBlocksByTime {
  private maxNumberOfBlockResults = 10_000
  private boundWitnessTable: BoundWitnessTable
  private publicKeyTable: PublicKeyTable
  public geoTable: GeohashTable
  public timeTable: TimeTable

  constructor(tablePrefix = 'xyo-archivist', region = 'us-east-1') {
    super()
    this.boundWitnessTable = new BoundWitnessTable(
      `${tablePrefix}-boundwitness`,
      region
    )
    this.publicKeyTable = new PublicKeyTable(`${tablePrefix}-chains`, region)
    this.geoTable = new GeohashTable(`${tablePrefix}-geohash`, region)
    this.timeTable = new TimeTable(`${tablePrefix}-time`, region)

    addAllDefaults()
  }

  public async initialize() {
    this.boundWitnessTable.initialize()
    this.publicKeyTable.initialize()
    this.geoTable.initialize()
    this.timeTable.initialize()
    return true
  }

  public async getOriginBlocksByPublicKey(
    publicKey: Buffer,
    index: number | undefined,
    limit: number | undefined,
    up: boolean
  ): Promise<{ items: Buffer[]; total: number }> {
    if ((limit || 100) > this.maxNumberOfBlockResults) {
      throw new Error('Max number of blocks reached')
    }

    const shortKey = this.sha1(publicKey)
    const scanResult = await this.publicKeyTable.scanByKey(
      shortKey,
      limit || 100,
      index || 0,
      up
    )

    const result: Buffer[] = []
    for (const hash of scanResult.items) {
      const data = await this.boundWitnessTable.getItem(hash)
      result.push(data)
    }
    return { items: result, total: scanResult.total }
  }

  public async removeOriginBlock(hash: Buffer): Promise<void> {
    const shortHash = this.sha1(hash)
    return this.boundWitnessTable.deleteItem(shortHash)
  }

  public async getOriginBlocksByGeohash(
    geohash: string,
    limit: number
  ): Promise<Buffer[]> {
    const hashes = await this.geoTable.getByGeohash(geohash, limit)

    const result: Buffer[] = []

    for (const hash of hashes) {
      const data = await this.boundWitnessTable.getItem(this.sha1(hash))
      result.push(data)
    }

    return result
  }

  public async addGeoIndex(hash: Buffer, originBlock: Buffer): Promise<void> {
    const bw = new XyoBoundWitness(originBlock)

    for (const party of bw.getHeuristics()) {
      for (const huerestic of party) {
        if (huerestic.getSchema().id === XyoObjectSchema.GPS.id) {
          const point = gpsResolver.resolve(
            huerestic.getAll().getContentsCopy()
          ).value
          const geohash = ngeohash.encode(point.lat, point.lng)
          this.logInfo(
            `Adding geohash: ${geohash} at ${point.lat}, ${point.lng}`
          )
          await this.geoTable.putItem(geohash, hash)
        }
      }
    }
  }

  public async addOriginBlock(
    hash: Buffer,
    originBlock: Buffer
  ): Promise<void> {
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

      await this.addGeoIndex(hash, originBlock)
      await this.timeTable.putItem(originBlock)
      return await this.boundWitnessTable.putItem(shortHash, originBlock)
    } catch (ex) {
      this.logError(ex)
      throw ex
    }
  }

  public async addOriginBlockPublicKeys(
    hash: Buffer,
    originBlock: Buffer
  ): Promise<void> {
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

    while (blockIt.hasNext()) {
      const block = blockIt.next().value
      const hash = hashIt.next().value
      await this.addOriginBlock(
        hash.getAll().getContentsCopy(),
        block.getAll().getContentsCopy()
      )
    }
  }

  public async getOriginBlock(hash: Buffer): Promise<Buffer | undefined> {
    const shortHash = this.sha1(hash)
    const data = await this.boundWitnessTable.getItem(shortHash)
    if (data) {
      return data
    }
  }

  public async getOriginBlocks(
    limit: number,
    offsetHash?: Buffer | undefined
  ): Promise<{ items: Buffer[]; total: number }> {
    const shortOffsetHash = offsetHash ? this.sha1(offsetHash) : undefined
    const items = await this.boundWitnessTable.scan(limit, shortOffsetHash)
    const result: Buffer[] = []

    for (const item of items) {
      result.push(item)
    }

    return {
      items: result,
      total: (await this.boundWitnessTable.getRecordCount()) || -1,
    }
  }

  public async getOriginBlocksByTime(
    fromTime: number,
    limit: number
  ): Promise<{ items: Buffer[]; lastTime: number }> {
    const hourBucket = Math.floor(fromTime / (1000 * 60 * 60))

    const blocks = await this.timeTable.getByTime(hourBucket, fromTime, limit)

    if (blocks.results.length >= limit || blocks.results.length === 0) {
      return {
        items: blocks.results,
        lastTime: blocks.lastTime,
      }
    }

    const delta = limit - blocks.results.length

    const nextPageOfBlocks = await this.getOriginBlocksByTime(
      blocks.lastTime,
      delta
    )

    return {
      items: blocks.results.concat(nextPageOfBlocks.items),
      lastTime: nextPageOfBlocks.lastTime,
    }
  }

  private sha1(data: Buffer) {
    return crypto.createHash('sha1').update(data).digest()
  }
}
