/*
 * File: xyo-dynamo-archivist-repository.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 2:04:07 pm
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Tuesday, 23rd April 2019 9:47:29 am
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
import chalk from 'chalk'

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
    throw new XyoError('getOriginBlocksByPublicKey: Not Implemented')
    return {
      publicKeys: [],
      boundWitnesses: []
    }
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
    return this.boundWitnessTable.deleteItem(hash)
  }

  public async containsOriginBlock(hash: Buffer): Promise<boolean> {
    return this.boundWitnessTable.getItem(hash)
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
      const blockHash = hash.serialize()
      for (const pks of originBlock.publicKeys) {
        for (const pk of pks.keys) {
          await this.publicKeyTable.putItem(pk.serialize(), blockHash)
        }
      }
      return await this.boundWitnessTable.putItem(blockHash, originBlock.serialize())
    } catch (ex) {
      console.log(chalk.red(ex))
      throw ex
    }
  }

  public async getOriginBlockByHash(hash: Buffer): Promise < IXyoBoundWitness | undefined > {
    return this.boundWitnessTable.getItem(hash)
  }

  public async getBlocksThatProviderAttribution(hash: Buffer): Promise < { [h: string]: IXyoBoundWitness } > {
    throw new XyoError('getBlocksThatProviderAttribution: Not Implemented')
    return {

    }
  }

  public async getOriginBlocks(limit: number, offsetHash ?: Buffer | undefined): Promise < IOriginBlockQueryResult > {
    const items = await this.boundWitnessTable.scan(limit, offsetHash)
    const result: IOriginBlockQueryResult = {
      list: [],
      totalSize: items.length || -1,
      hasNextPage: true
    }
    for (const item of items) {
      result.list.push(XyoBoundWitness.deserializer.deserialize(item.Data.B as Buffer, this.serializationService))
    }
    return result
  }
}
