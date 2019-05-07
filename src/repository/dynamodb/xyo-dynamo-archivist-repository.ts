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

import {
  IXyoArchivistRepository
} from '..'

import { XyoBase } from '@xyo-network/sdk-base-nodejs'

import _ from 'lodash'
import { BoundWitnessTable } from './table/boundwitness'
import { PublicKeyTable } from './table/publickey'
import crypto from 'crypto'
import bs58 from 'bs58'
import { XyoBoundWitness, XyoObjectSchema, XyoSha256, indexResolver, IXyoBoundWitnessOrigin, XyoBoundWitnessOriginGetter } from '@xyo-network/sdk-core-nodejs'
import { XyoIterableStructure, XyoStructure, XyoSchema } from '@xyo-network/object-model'
import { ChainTable, IChainRow } from './table/chain'

// Note: We use Sha1 hashes in DynamoDB to save space!  All functions calling to the tables
// must use shortHashes (sha1)

export class XyoArchivistDynamoRepository extends XyoBase implements IXyoArchivistRepository {
  private maxNumberOfBlockResults = 10_000
  private boundWitnessTable: BoundWitnessTable
  private publicKeyTable: PublicKeyTable
  private chainsTable: ChainTable

  constructor(
    tablePrefix: string = 'xyo-archivist-development',
    region: string = 'us-east-1'
  ) {
    super()
    this.boundWitnessTable = new BoundWitnessTable(`${tablePrefix}-boundwitness`, region)
    this.publicKeyTable = new PublicKeyTable(`${tablePrefix}-publickey`, region)
    this.chainsTable = new ChainTable(`${tablePrefix}-chains`, region)
  }

  public async initialize() {
    this.boundWitnessTable.initialize()
    this.publicKeyTable.initialize()
    this.chainsTable.initialize()
    return true
  }

  public async getOriginBlocksByPublicKey(publicKey: Buffer, cursor: Buffer | undefined, limit: number | undefined) {
    if ((limit || 100) > this.maxNumberOfBlockResults) {
      throw new Error('Max number of blocks reached')
    }

    const shortKey = this.sha1(publicKey)
    const scanResult = await this.publicKeyTable.scanByKey(shortKey, limit || 100, cursor)

    const result: Buffer[] = []
    for (const hash of scanResult.items) {
      const data = await this.boundWitnessTable.getItem(hash)
      result.push(data)
    }
    return { items: result, total:scanResult.total }
  }

  public async getEntities(limit: number, offsetCursor?: Buffer | undefined): Promise<{items: Buffer[], total: number}> {
    throw new Error('getEntities: Not Implemented')
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
    throw new Error('getAllOriginBlockHashes: Not Implemented')
  }

  public async addOriginBlock(
    hash: Buffer,
    originBlock: Buffer
  ): Promise<void> {
    try {
      const shortHash = this.sha1(hash)

      const bw = new XyoBoundWitness(originBlock)
      await this.createSegments(bw)
      for (const pks of bw.getPublicKeys()) {
        for (const pk of pks) {
          const shortKey = this.sha1(pk.getAll().getContentsCopy())
          await this.publicKeyTable.putItem(shortKey, shortHash)
        }
      }
      return await this.boundWitnessTable.putItem(shortHash, originBlock)
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
      this.logInfo(`Found nested block with hash: ${bs58.encode(hash.getAll().getContentsCopy())}`)
      this.addOriginBlock(hash.getAll().getContentsCopy(), block.getAll().getContentsCopy())
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

  public async getFromChainUp(startingChainSegmentId: Buffer, limit: number, offsetIndex: number): Promise<Buffer[]> {
    const firstResult = await this.getFromSegment(startingChainSegmentId, true, limit, offsetIndex - 1)

    // found thr amount we wanted so we can return
    if (firstResult.items.length >= limit) {
      return firstResult.items
    }

    if (!firstResult.topLink || firstResult.items.length === 0 || !firstResult.topIndex) {
      // hit the end of the chain
      return firstResult.items
    }

    const delta = limit - firstResult.items.length

    const toReturn: Buffer[] = firstResult.items
    const result = await this.getFromChainUp(firstResult.topLink, delta, firstResult.topIndex)

    for (const item of result) {
      toReturn.push(item)
    }

    return toReturn
  }

  public async getFromChainDown(startingChainSegmentId: Buffer, limit: number, offsetIndex: number): Promise<Buffer[]> {
    const firstResult = await this.getFromSegment(startingChainSegmentId, false, limit, offsetIndex + 1)
    console.log(firstResult.items.length)
    console.log(firstResult.bottomLink)

    // found thr amount we wanted so we can return
    if (firstResult.items.length >= limit) {
      return firstResult.items
    }

    if (!firstResult.bottomLink || firstResult.items.length === 0 || !firstResult.bottomIndex) {
      // hit the end of the chain
      return firstResult.items
    }

    // 4 - 2
    const delta = limit - firstResult.items.length

    const toReturn: Buffer[] = firstResult.items
    const result = await this.getFromChainDown(firstResult.bottomLink, delta, firstResult.bottomIndex)

    for (const item of result) {
      toReturn.push(item)
    }

    return toReturn
  }
  private sha1(data: Buffer) {
    return crypto.createHash('sha1').update(data).digest()
  }

  private async createSegments(boundWitness: XyoBoundWitness): Promise<void> {
    const allPublicKeys = boundWitness.getPublicKeys()
    const allOrigins = XyoBoundWitnessOriginGetter.getOriginInformation(boundWitness)
    const hash = boundWitness.getHash(new XyoSha256())

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < allPublicKeys.length; i++) {
      const publicKeysOfParty = allPublicKeys[i].map((item) => {
        return this.sha1(item.getAll().getContentsCopy())
      })

      const row = await this.findOrCreateChainRow(allOrigins[i], publicKeysOfParty, this.sha1(hash.getAll().getContentsCopy()))

      if (row) {
        await this.chainsTable.putItem(row)
      }
    }
  }

  // todo move into the
  private async findOrCreateChainRow(origin: IXyoBoundWitnessOrigin, publicKeys: Buffer[], hash: Buffer): Promise < IChainRow | undefined> {
    const minPreviousHash = origin.previousHash && this.sha1(origin.previousHash)
    const minNextPublicKey =  origin.nextPublicKey && this.sha1(origin.nextPublicKey)
    const segmentIdTop = await this.traverseBlockUp(hash, publicKeys, minNextPublicKey)
    let segmentIdBelow: IChainRow | undefined

    if (minPreviousHash) {
      segmentIdBelow = await this.traverseBlockDown(minPreviousHash, publicKeys)
    }

    if (segmentIdTop && segmentIdBelow && segmentIdTop.hash && segmentIdTop.segmentId) {
      // do merge here

      const didNotExist = await this.chainsTable.putItem({
        hash,
        publicKeys,
        nextPublicKey: minNextPublicKey,
        previousHash: minPreviousHash,
        index: origin.index,
        segmentId: segmentIdBelow.segmentId,
        topSegment: segmentIdTop.segmentId,
        bottomSegment: undefined,
      })

      if (didNotExist) {
        this.logInfo(`Merging block segments: ${segmentIdTop.segmentId.toString('base64')}, ${segmentIdBelow.segmentId.toString('base64')}`)
        await this.chainsTable.updateBottomSegment(segmentIdBelow.segmentId, segmentIdTop.index, segmentIdTop.segmentId)
      }

      return undefined
    }

    if (segmentIdTop) {
      this.logInfo(`Adding block with hash ${bs58.encode(hash)} below ${segmentIdTop.segmentId.toString('base64')}`)
    } else if (segmentIdBelow) {
      this.logInfo(`Adding block with hash ${bs58.encode(hash)} on top of ${segmentIdBelow.segmentId.toString('base64')}`)
    } else {
      this.logInfo(`Adding block with hash ${bs58.encode(hash)} to new segment`)
    }

    // if no segment is found, create a new segment
    const segId = ((segmentIdBelow && segmentIdBelow.segmentId) || (segmentIdTop && segmentIdTop.segmentId)) || hash

    return {
      hash,
      publicKeys,
      nextPublicKey: minNextPublicKey,
      previousHash: minPreviousHash,
      index: origin.index,
      segmentId: segId,
      topSegment: undefined,
      bottomSegment: undefined,
    }
  }

  private async getFromSegment(chainSegmentId: Buffer, up: boolean, limit: number, offsetIndex: number): Promise < {
    items: Buffer[],
    topLink: Buffer | undefined,
    topIndex: number | undefined,
    bottomIndex: number | undefined,
    bottomLink: Buffer | undefined
  } > {
    const items = await this.chainsTable.getBySegmentId(chainSegmentId, up, limit, offsetIndex)

    const hashes: Buffer[] = []
    let topLink: Buffer | undefined
    let bottomLink: Buffer | undefined
    let topIndex: number | undefined
    let bottomIndex: number | undefined

    for (const item of items) {
      if (item.bottomSegment) {
        bottomLink = item.bottomSegment
      } else if (item.topSegment) {
        topLink = item.topSegment
      }

      if ((topIndex || 0) < item.index) {
        topIndex = item.index
      }

      if ((bottomIndex || item.index) >= item.index) {
        bottomIndex = item.index
      }

      hashes.push(item.hash)
    }

    return {
      topLink,
      bottomLink,
      bottomIndex,
      topIndex,
      items: hashes,
    }
  }

  private async traverseBlockDown(previousHash: Buffer, publicKeys: Buffer[]): Promise < IChainRow | undefined > {
    const blockParties = await this.chainsTable.getByHash(previousHash)

    for (const party of blockParties) {

      // check to see if the public keys are equal, if so it is the correct party
      for (const publicKey of publicKeys) {
        for (const partyPublicKey of party.publicKeys) {
          if (publicKey.equals(partyPublicKey)) {
            return party
          }
        }

        // check to see if the next public key is the public key, if so it is the correct party
        if (party.nextPublicKey && publicKey.equals(party.nextPublicKey)) {
          return party
        }
      }
    }

    return undefined
  }

  private async traverseBlockUp(hash: Buffer, publicKeys: Buffer[], nextPublicKey: Buffer | undefined): Promise < IChainRow | undefined > {
    const blockParties = await this.chainsTable.getByPreviousHash(hash)

    for (const party of blockParties) {

      // check to see if the public keys are equal, if so it is the correct party
      for (const publicKey of publicKeys) {
        for (const partyPublicKey of party.publicKeys) {

          // check to see if it is also the next public key
          if (publicKey.equals(partyPublicKey) || (nextPublicKey && publicKey.equals(nextPublicKey))) {
            return party
          }
        }
      }
    }

    return undefined
  }
}
