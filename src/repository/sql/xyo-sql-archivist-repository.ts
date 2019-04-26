/*
 * File: xyo-sql-archivist-repository.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:05 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Thursday, 25th April 2019 3:19:20 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import {
  IXyoArchivistRepository,
  IXyoOriginBlocksByPublicKeyResult,
  IXyoEntitiesList,
  IXyoIntersectionsList
} from '../'

import { SqlService } from './sql-service'
import _ from 'lodash'
import { BlocksTheProviderAttributionQuery } from './queries/originblockattributions/selectbyhash'
import { IntersectionsQuery } from './queries/intersections'
import { IntersectionsWithCursorQuery } from './queries/intersectionswithcursor'
import { EntitiesQueryWithCursor } from './queries/entitieswithcursor'
import { EntitiesQuery } from './queries/entities'
import { InsertKeySignaturesQuery } from './queries/keysignatures'
import { CreateOriginBlockPartiesQuery } from './queries/createoriginblockparties'
import { InsertPayloadItemsQuery } from './queries/payloaditems/insert'
import { UpsertPublicKeysQuery, SelectPublicKeysByKeysQuery } from './queries/publickeys'
import { InsertPublicKeyGroupQuery } from './queries/publickeygroups'
import { UpdateOriginBlockPartiesQuery, UnlinkOriginBlockPartiesQuery, DeleteOriginBlockPartiesQuery } from './queries/originblockparties'
import { SelectOriginBlocksByKeyQuery, SelectOriginBlocksByHashQuery, SelectOriginBlocksWithOffsetQuery, SelectOriginBlocksQuery } from './queries/originblocks'
import { DeletePayloadItemsQuery } from './queries/payloaditems'
import { XyoBase } from '@xyo-network/base'
import { XyoBoundWitness } from '@xyo-network/sdk-core-nodejs'
import { XyoBuffer } from '@xyo-network/object-model'

export class XyoArchivistSqlRepository extends XyoBase implements IXyoArchivistRepository {

  private static qryDeletePayloadItems = `
    DELETE p FROM PayloadItems p
      JOIN OriginBlockParties obp on obp.id = p.originBlockPartyId
      JOIN OriginBlocks ob on ob.id = obp.originBlockId
    WHERE ob.signedHash = ?;
  `

  private static qryDeleteKeySignatures = `
    DELETE k FROM KeySignatures k
      JOIN OriginBlockParties obp on obp.id = k.originBlockPartyId
      JOIN OriginBlocks ob on ob.id = obp.originBlockId
    WHERE ob.signedHash = ?;
  `

  private static qryDeleteOriginBlocks = `
    DELETE ob FROM OriginBlocks ob
    WHERE ob.signedHash = ?;
  `

  private static qryDeletePublicKeys = `
    DELETE pk FROM PublicKeys pk
      LEFT JOIN OriginBlockParties obp on obp.nextPublicKeyId = pk.id
      LEFT JOIN KeySignatures ks on ks.publicKeyId = pk.id
    WHERE obp.id IS NULL AND ks.publicKeyId IS NULL;
  `

  private static qryDeletePublicKeyGroups = `
    DELETE pkg FROM PublicKeyGroups pkg
      LEFT JOIN PublicKeys pk on pk.publicKeyGroupId = pkg.id
    WHERE pk.id IS NULL;
  `

  private static qryContainsOriginBlock = `
    SELECT
    COUNT(ob.id) > 0 as containsOriginBlock
      FROM OriginBlocks ob
    WHERE ob.signedHash = ?
  `

  private static qryAllOriginBlockHashes = `
    SELECT
      signedHash
    FROM OriginBlocks;
  `

  private static qryAggrigateKeys = `
    UPDATE PublicKeys pk
      SET pk.publicKeyGroupId = ?
    WHERE pk.publicKeyGroupId IN (?)
  `

  private static qryDeleteKeys = `
    DELETE FROM PublicKeyGroups WHERE id IN (?)
  `

  private static qryInsertOriginBlocks = `
    INSERT INTO OriginBlocks(signedHash, signedBytes, bytes, bridgedFromBlock, meta)
    VALUES(?, ?, ?, ?, ?);
  `

  private static qryCreatePublicKeyGroup = `
    INSERT INTO PublicKeyGroups() VALUES()
  `

  constructor(
    private readonly sqlService: SqlService
  ) {
    super()
  }

  public async initialize() {
    return true
  }

  public async getOriginBlocksByPublicKey(publicKey: Buffer): Promise<{items: Buffer[], total: number}> {
    return new SelectOriginBlocksByKeyQuery(this.sqlService).send(publicKey)
  }

  public async getEntities(limit: number, cursor?: Buffer): Promise<{items: Buffer[], total: number}> {
    throw new Error('getEntities: stub')
    // if (!cursor) {
    //   return new EntitiesQuery(this.sqlService).send({ limit })
    // }
    // return new EntitiesQueryWithCursor(this.sqlService).send({ limit, cursor })
  }

  public async removeOriginBlock(hash: Buffer): Promise<void> {
    const hexHash = hash.toString('base64gy')

    await new DeletePayloadItemsQuery(this.sqlService).send(
      { hash: hexHash }
    )

    await this.sqlService.query(XyoArchivistSqlRepository.qryDeleteKeySignatures, [hexHash])

    await new UnlinkOriginBlockPartiesQuery(this.sqlService).send(
      { hash: hexHash }
    )

    await new DeleteOriginBlockPartiesQuery(this.sqlService).send(
      { hash: hexHash }
    )

    await this.sqlService.query(XyoArchivistSqlRepository.qryDeleteOriginBlocks, [hexHash])

    await this.sqlService.query(XyoArchivistSqlRepository.qryDeletePublicKeys)

    await this.sqlService.query(XyoArchivistSqlRepository.qryDeletePublicKeyGroups)
  }

  public async addOriginBlocks(hashes: Buffer, blocks: Buffer): Promise<void> {
    return
  }

  public async containsOriginBlock(hash: Buffer): Promise<boolean> {
    const result = await this.sqlService.query<Array<{containsOriginBlock: number}>>(
      XyoArchivistSqlRepository.qryContainsOriginBlock, [hash.toString('base64')])

    return Boolean(result[0].containsOriginBlock)
  }

  public async getAllOriginBlockHashes(): Promise<Buffer[]> {
    const result = await this.sqlService.query<Array<{signedHash: string}>>(
      XyoArchivistSqlRepository.qryAllOriginBlockHashes)

    return result.map(item => Buffer.from(item.signedHash, 'base64'))
  }

  public async addOriginBlock(
    hash: Buffer,
    block: Buffer,
  ): Promise<void> {
    throw new Error('addOriginBlock: stub')
    /*
    try {
      const boundWitness = new XyoBoundWitness(new XyoBuffer(block))
      const originBlockId = await this.tryCreateNewOriginBlock(hash, boundWitness)
      const publicKeySets = await this.tryCreatePublicKeys(boundWitness)

      const originBlockPartyIds = await new CreateOriginBlockPartiesQuery(this.sqlService).send({
        boundWitness,
        originBlockId,
        publicKeyGroupIds: publicKeySets.map((pks: any) => pks.publicKeyGroupId)
      })

      const keySignatureSets = await this.tryCreateKeySignatureSets(
        publicKeySets,
        originBlockPartyIds,
        boundWitness
      )

      const payloadItemsIds = await this.tryCreatePayloadItems(originBlock, originBlockPartyIds)

      await originBlockPartyIds.reduce(async (promiseChain, originBlockPartyId) => {
        await promiseChain
        return this.linkPreviousInsertOriginBlockParties(originBlockPartyId)
      },                               Promise.resolve() as Promise<void>)

      await originBlock.parties.reduce(async (promiseChain, blockParty) => {
        await promiseChain
        const bridgeHashSetCandidate = blockParty.heuristics.find(h => h.schemaObjectId === schema.bridgeHashSet.id)
        if (bridgeHashSetCandidate === undefined) {
          return
        }

        const bridgeHashSet = bridgeHashSetCandidate as XyoBridgeHashSet
        const values = bridgeHashSet.hashSet.map(
          h => `('${hash.serializeHex()}', ${blockParty.partyIndex}, '${h.serializeHex()}' )`
        )
        if (values.length === 0) {
          return
        }

        const valuesQuery = values.join(',\n')
        await this.sqlService.query(`
          INSERT INTO OriginBlockAttributions (
            sourceSignedHash,
            originBlockPartyIndex,
            providesAttributionForSignedHash
          ) VALUES ${valuesQuery};
        `,                          [])
      },                               Promise.resolve())

      const idHierarchy = {
        originBlockId,
        originBlockPartyIds,
        publicKeyGroupIds: publicKeySets.map(pks => pks.publicKeyGroupId),
        publicKeys: publicKeySets.map(pks => pks.publicKeyIds.join(', ')),
        keySignatureSets: keySignatureSets.map(keySignatureArray => keySignatureArray.join(', ')),
        payloadItemsIds: payloadItemsIds.map(payloadItemArray => payloadItemArray.join(', ')),
      }

      this.logInfo(
        `Successfully created an origin block with component parts:\n${XyoBase.stringify(idHierarchy)}`
      )
    } catch (err) {
      this.logError('Failed to add an origin block', err)
      throw err
    }*/
  }

  public async getOriginBlock(hash: Buffer): Promise<Buffer | undefined> {
    return new SelectOriginBlocksByHashQuery(this.sqlService).send({ hash })
  }

  public async getBlocksThatProviderAttribution(hash: Buffer): Promise<{[h: string]: XyoBoundWitness}> {
    return new BlocksTheProviderAttributionQuery(this.sqlService).send({ hash })
  }

  public async getOriginBlocks(limit: number, offsetHash?: Buffer | undefined): Promise<{items: Buffer[], total: number}> {
    throw new Error('getOriginBlocks: stub')
    /*if (offsetHash) {
      return new SelectOriginBlocksWithOffsetQuery(
        this.sqlService, this.serializationService).send({ limit, offsetHash })
    }
    return new SelectOriginBlocksQuery(this.sqlService).send({ limit })*/
  }

  private async tryCreatePublicKeys(originBlock: XyoBoundWitness) {
    throw new Error('tryCreatePublicKeys: stub')
    /*try {
      const result = await originBlock.publicKeys.reduce(async (promiseChain: any, publicKeySet: any) => {
        const aggregator = await promiseChain
        const pkSet = await this.tryCreatePublicKeyset(publicKeySet.keys)
        aggregator.push(pkSet)
        return aggregator
      },                                                 Promise.resolve([]) as Promise<Array<{publicKeyGroupId: number, publicKeyIds: number[]}>>)

      const allPublicKeyIds = _.chain(result).map('publicKeyIds').flatten().join(', ').value()
      const allPublicKeyGroupIds = _.chain(result).map('publicKeyGroupId').join(', ').value()
      this.logInfo(`Succeeded in creating public keys with ids ${allPublicKeyIds}`)
      this.logInfo(`Succeeded in creating public key group with ids ${allPublicKeyGroupIds}`)
      return result
    } catch (err) {
      this.logError('Failed to create Public Keys', err)
      throw err
    }*/
  }

  private async tryCreatePublicKeyset(
    publicKeySet: Buffer[]
  ): Promise<{publicKeyGroupId: number, publicKeyIds: number[]}> {
    throw new Error('tryCreatePublicKeyset: stub')
    /*
    try {
      const pks = _.chain(publicKeySet).map((key: any) => key.serializeHex()).value()
      const existingKeys = await new SelectPublicKeysByKeysQuery(this.sqlService).send(pks)

      if (existingKeys.length === 0) {
        const publicKeyGroupId = await this.createNewPublicKeyGroup()
        const publicKeyIds = await publicKeySet.reduce(async (idCollectionPromise, key) => {
          const ids = await idCollectionPromise
          const newId = await new UpsertPublicKeysQuery(this.sqlService).send(
            {
              key,
              publicKeyGroupId
            }
          )

          ids.push(newId)
          return ids
        },                                             Promise.resolve([]) as Promise<number[]>)

        return {
          publicKeyGroupId,
          publicKeyIds
        }
      }

      const keysGroupedByPublicKeyGroupId = _.chain(existingKeys).groupBy('publicKeyGroupId').value()
      const allKeysBelongToSamePublicKeyGroup = Object.keys(keysGroupedByPublicKeyGroupId).length === 1
      const allKeysExist = existingKeys.length === pks.length

      const aggregateMismatchedPublicKeyGroups = async () => {
        const sortedKeys = _.chain(keysGroupedByPublicKeyGroupId).keys().sortBy().value()
        const firstKey = _.chain(sortedKeys).first().parseInt(10).value()
        const otherKeys = _.chain(sortedKeys).drop(1).map((sk: any) => parseInt(sk, 10)).value()
        await this.sqlService.query(XyoArchivistSqlRepository.qryAggrigateKeys, [firstKey, otherKeys])
        await this.sqlService.query(XyoArchivistSqlRepository.qryDeleteKeys, [otherKeys])
        return firstKey
      }

      const addNewKeysToExistingPublicKeyGroup = async (
        keysGroupedByPublicKeyGroup: {[s: string]: Array<{ id: number; key: string; publicKeyGroupId: number}>}
      ) => {
        const keysThatNeedToBeCreated = _.difference(
          pks,
          _.chain(keysGroupedByPublicKeyGroup).values().first().map('key').value()
        )

        const publicKeyGroupId = _.chain(keysGroupedByPublicKeyGroup).keys().first().parseInt(10).value()
        const newlyCreatedPublicKeyIds = await _.reduce(
          keysThatNeedToBeCreated,
          async (promiseChain: any, keyThatNeedToBeCreated: any) => {
            const ids = await promiseChain
            const newId = await new UpsertPublicKeysQuery(this.sqlService).send(
              {
                publicKeyGroupId,
                key: keyThatNeedToBeCreated
              }
            )
            ids.push(newId)
            return ids
          },
          Promise.resolve([]) as Promise<number[]>
        )

        return {
          publicKeyGroupId,
          publicKeyIds: [
            ...(_.chain(keysGroupedByPublicKeyGroupId).values().first().map('id').value() as number[]),
            ...newlyCreatedPublicKeyIds
          ]
        }
      }

      if (allKeysExist && allKeysBelongToSamePublicKeyGroup) {
        return {
          publicKeyGroupId: _.chain(keysGroupedByPublicKeyGroupId).keys().first().parseInt(10).value(),
          publicKeyIds: _.chain(existingKeys).map('id').value() as number[]
        }
      }

      if (allKeysExist && !allKeysBelongToSamePublicKeyGroup) {
        const firstKey = await aggregateMismatchedPublicKeyGroups()
        return {
          publicKeyGroupId: firstKey,
          publicKeyIds: _.chain(existingKeys).map('id').value() as number[]
        }
      }

      if (!allKeysExist && allKeysBelongToSamePublicKeyGroup) {
        return addNewKeysToExistingPublicKeyGroup(keysGroupedByPublicKeyGroupId)
      }

      if (!allKeysExist && !allKeysBelongToSamePublicKeyGroup) {
        const firstKey = await aggregateMismatchedPublicKeyGroups()
        const arrayValue = _.chain(keysGroupedByPublicKeyGroupId).values().flatten().value()
        const newKeysGroupedByPublicKeyGroupId = {
          [firstKey]: arrayValue
        }

        return addNewKeysToExistingPublicKeyGroup(newKeysGroupedByPublicKeyGroupId)
      }

      throw new Error('This should never get here exception')

    } catch (err) {
      this.logError('Failed to create Public Keys', err)
      throw err
    }
    */
  }

  private async tryCreateNewOriginBlock(
    hash: Buffer,
    originBlock: XyoBoundWitness,
    bridgedFromOriginBlockHash?: Buffer
  ): Promise<number> {
    throw new Error('tryCreateNewOriginBlock: stub')
    /*
    try {
      const id = (await this.sqlService.query<{insertId: number}>(
        XyoArchivistSqlRepository.qryInsertOriginBlocks, [
          hash.serializeHex(),
          originBlock.getSigningData(),
          originBlock.serialize(),
          (
            bridgedFromOriginBlockHash &&
            bridgedFromOriginBlockHash.serializeHex()) || null,
          JSON.stringify(originBlock.getReadableValue(), null, 2)
        ]
      )).insertId

      this.logInfo(`Created new origin block with id ${id}`)
      return id
    } catch (err) {
      this.logError('Failed to create new origin block', err)
      throw err
    }
    */
  }

  /*private async createNewPublicKeyGroup(): Promise<number> {
    return new InsertPublicKeyGroupQuery(this.sqlService).send()
  }

  private async createPayloadItems(originBlockPartyId: number, payload: IXyoSerializableObject[], isSigned: boolean) {
    return payload.reduce(
      this.createPayloadItemReducer(originBlockPartyId, isSigned),
      Promise.resolve([]) as Promise<number[]>
    )
  }

  private createPayloadItemReducer(originBlockPartyId: number, isSigned: boolean) {
    return async (promiseChain: Promise<number[]>, payloadItem: IXyoSerializableObject, currentIndex: number) => {
      const ids = await promiseChain
      const newId = await new InsertPayloadItemsQuery(this.sqlService).send(
        {
          originBlockPartyId,
          isSigned,
          payloadItem,
          currentIndex
        }
      )
      ids.push(newId)
      return ids
    }
  }

  private async tryCreateKeySignatureSets(
    publicKeySets: IPublicKeySetGroup[],
    originBlockParties: number[],
    originBlock: XyoBoundWitness
  ): Promise<number[][]> {
    try {
      const ids = await publicKeySets.reduce(async (promiseChain, publicKeySet, currentIndex) => {
        const collections = await promiseChain
        const newIds = await new InsertKeySignaturesQuery(this.sqlService).send(
          { publicKeyIds: publicKeySet.publicKeyIds,
            originBlockPartyId: originBlockParties[currentIndex],
            signatures: originBlock.signatures[currentIndex].signatures }
        )
        collections.push(newIds)
        return collections
      },                                     Promise.resolve([]) as Promise<number[][]>)

      this.logInfo(`Successfully create key signature sets with ids ${_.flatten(ids).join(', ')}`)
      return ids
    } catch (err) {
      this.logError('Failed to create key signature sets', err)
      throw err
    }
  }

  private async tryCreatePayloadItems(
    originBlock: Buffer,
    originBlockParties: number[]
  ) {
    try {
      const boundWitness = new XyoBoundWitness(originBlock)
      const heuristics = new XyoHeuristicGetter()
      const result = await [...boundWitness.heuristics, ...boundWitness.metadata]
      .reduce(async (promiseChain, payload, currentIndex) => {
        const ids = await promiseChain
        const payloadItemIds = await this.createPayloadItems(
          originBlockParties[currentIndex % originBlockParties.length],
          payload,
          currentIndex < boundWitness.heuristics.length
        )
        ids.push(payloadItemIds)
        return ids
      },      Promise.resolve([]) as Promise<number[][]>)

      const allIds = _.chain(result).flatten().join(', ').value()
      this.logInfo(`Succeeded in creating PayloadItems with ids ${allIds}`)
      return result
    } catch (err) {
      this.logError('Failed to create PayloadItems', err)
      throw err
    }
  }

  private async linkPreviousInsertOriginBlockParties(originBlockPartyId: number) {
    await new UpdateOriginBlockPartiesQuery(this.sqlService).send(
      { originBlockPartyId }
    )
  }
  */
}

interface IPublicKeySetGroup {
  publicKeyGroupId: number
  publicKeyIds: number[]
}
