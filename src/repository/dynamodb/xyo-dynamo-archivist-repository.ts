/*
 * File: xyo-dynamo-archivist-repository.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 2:04:07 pm
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Tuesday, 23rd April 2019 12:34:39 pm
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
import { IXyoPublicKey, IXyoSignature } from '@xyo-network/signing'
import { IXyoBoundWitness, XyoBoundWitness } from '@xyo-network/bound-witness'
import { IXyoSerializationService, IXyoSerializableObject } from '@xyo-network/serialization'

import _ from 'lodash'
import { DynamoDB } from 'aws-sdk'
import { IXyoHash } from '@xyo-network/hashing'
import { IOriginBlockQueryResult } from '@xyo-network/origin-block-repository'
import { XyoError } from '@xyo-network/errors'
import { BoundWitnessTable } from './table/boundwitness'
import { PublicKeyTable } from './table/publickey'
import crypto from 'crypto'

// Note: We use Sha1 hashes in DynamoDB to save space!  All functions calling to the tables
// must use shortHashes (sha1)

export class XyoArchivistDynamoRepository extends XyoBase implements IXyoArchivistRepository {

  private boundWitnessTable: BoundWitnessTable
  private publicKeyTable: PublicKeyTable

  constructor(
    private readonly serializationService: IXyoSerializationService,
    private readonly tablePrefix: string = 'xyo-archivist',
    region: string = 'us-east-1'
  ) {
    super()
    this.boundWitnessTable = new BoundWitnessTable(`${tablePrefix}-boundwitness`, region)
    this.publicKeyTable = new PublicKeyTable(`${tablePrefix}-publickey`, region)
  }

  public async initialize() {
    this.boundWitnessTable.initialize()
    this.publicKeyTable.initialize()
    return true
  }

  public async getOriginBlocksByPublicKey(publicKey: IXyoPublicKey): Promise<IXyoOriginBlocksByPublicKeyResult> {
    const shortKey = this.sha1(publicKey.serialize())
    const hashes = await this.publicKeyTable.scanByKey(shortKey, 100)

    const result: {
      publicKeys: IXyoPublicKey[],
      boundWitnesses: IXyoBoundWitness[]
    } = {
      publicKeys: [],
      boundWitnesses: []
    }

    for (const hash of hashes) {
      const data = await this.boundWitnessTable.getItem(hash)
      const bw = XyoBoundWitness.deserializer.deserialize(data, this.serializationService)
      result.boundWitnesses.push(bw)
      result.publicKeys.push(publicKey)
    }
    return result
  }

  public async getIntersections(
    publicKeyA: string,
    publicKeyB: string,
    limit: number,
    cursor: string | undefined
  ): Promise<IXyoIntersectionsList> {
    throw new XyoError('getIntersections: Not Implemented')
    return {
      list: [],
      hasNextPage: false,
      totalSize: 0,
      cursor: undefined
    }
  }

  public async getEntities(limit: number, offsetCursor?: string | undefined): Promise<IXyoEntitiesList> {
    throw new XyoError('getEntities: Not Implemented')
    return {
      list: [],
      hasNextPage: false,
      totalSize: 0,
      cursor: undefined
    }
  }

  public async removeOriginBlock(hash: Buffer): Promise<void> {
    const shortHash = this.sha1(hash)
    return this.boundWitnessTable.deleteItem(shortHash)
  }

  public async containsOriginBlock(hash: Buffer): Promise<boolean> {
    const shortHash = this.sha1(hash)
    return this.boundWitnessTable.getItem(shortHash)
  }

  public async getAllOriginBlockHashes(): Promise<Buffer[]> {
    throw new XyoError('getAllOriginBlockHashes: Not Implemented')
    return []
  }

  public async addOriginBlock(
    hash: IXyoHash,
    originBlock: IXyoBoundWitness,
    bridgedFromOriginBlockHash?: IXyoHash
  ): Promise<void> {
    try {
      const shortHash = this.sha1(hash.serialize())
      for (const pks of originBlock.publicKeys) {
        for (const pk of pks.keys) {
          const shortKey = this.sha1(pk.serialize())
          await this.publicKeyTable.putItem(shortKey, shortHash)
        }
      }
      return await this.boundWitnessTable.putItem(shortHash, originBlock.serialize())
    } catch (ex) {
      this.logError(ex)
      throw ex
    }
  }

  public async getOriginBlockByHash(hash: Buffer): Promise < IXyoBoundWitness | undefined > {
    const shortHash = this.sha1(hash)
    const data = await this.boundWitnessTable.getItem(shortHash)
    if (data) {
      return XyoBoundWitness.deserializer.deserialize(data, this.serializationService)
    }
  }

  public async getBlocksThatProviderAttribution(hash: Buffer): Promise < { [h: string]: IXyoBoundWitness } > {
    throw new XyoError('getBlocksThatProviderAttribution: Not Implemented')
    return {

    }
  }

  public async getOriginBlocks(limit: number, offsetHash ?: Buffer | undefined): Promise < IOriginBlockQueryResult > {
    const shortOffsetHash = offsetHash ? this.sha1(offsetHash) : undefined
    const items = await this.boundWitnessTable.scan(limit, shortOffsetHash)
    const result: IOriginBlockQueryResult = {
      list: [],
      totalSize: items.length || -1,
      hasNextPage: true
    }
    for (const item of items) {
      result.list.push(XyoBoundWitness.deserializer.deserialize(item, this.serializationService))
    }
    return result
  }

  private sha1(data: Buffer) {
    return crypto.createHash('sha1').update(data).digest()
  }
}
