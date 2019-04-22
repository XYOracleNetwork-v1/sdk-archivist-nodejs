/*
 * File: xyo-level-archivist-repository.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:05 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Thursday, 18th April 2019 9:50:33 am
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
import { IXyoBoundWitness } from '@xyo-network/bound-witness'
import { IXyoSerializationService, IXyoSerializableObject } from '@xyo-network/serialization'

import _ from 'lodash'
import { IXyoHash } from '@xyo-network/hashing'
import { IOriginBlockQueryResult } from '@xyo-network/origin-block-repository'

import levelup, { LevelUp } from 'levelup'
import leveldown from 'leveldown'
import { AbstractIteratorOptions } from 'abstract-leveldown'

export class XyoArchivistLevelRepository extends XyoBase implements IXyoArchivistRepository {

  private db: LevelUp

  constructor(
    private readonly serializationService: IXyoSerializationService
  ) {
    super()
    this.db = levelup(leveldown('./xyo-blocks'))
  }

  public async getOriginBlocksByPublicKey(publicKey: IXyoPublicKey): Promise<IXyoOriginBlocksByPublicKeyResult> {
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
    return {
      list: [],
      hasNextPage: false,
      totalSize: 0,
      cursor: undefined
    }
  }

  public async getEntities(limit: number, offsetCursor?: string | undefined): Promise<IXyoEntitiesList> {
    return {
      list: [],
      hasNextPage: false,
      totalSize: 0,
      cursor: undefined
    }
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
    hash: IXyoHash,
    originBlock: IXyoBoundWitness,
    bridgedFromOriginBlockHash?: IXyoHash
  ): Promise<void> {
    return this.db.put(hash.getData(), originBlock.srcBuffer)
  }

  public async getOriginBlockByHash(hash: Buffer): Promise<IXyoBoundWitness | undefined> {
    return this.db.get(hash)
  }

  public async getBlocksThatProviderAttribution(hash: Buffer): Promise<{[h: string]: IXyoBoundWitness}> {
    return {

    }
  }

  public async getOriginBlocks(limit: number, offsetHash?: Buffer | undefined): Promise<IOriginBlockQueryResult> {
    const options: AbstractIteratorOptions = {
      limit
    }

    if (offsetHash) {
      options.gt = offsetHash
    }

    const blocks: IXyoBoundWitness[] = []

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
    return {
      list: [],
      hasNextPage: (blocks.length === limit),
      totalSize: -1
    }
  }
}
