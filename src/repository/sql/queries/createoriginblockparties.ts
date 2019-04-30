/*
 * File: createoriginblockparties.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:00 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Sunday, 21st April 2019 2:02:48 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { SqlQuery } from './query'
import { SqlService } from '../sql-service'
import _ from 'lodash'
import { SelectAllOriginBlockPartyIdsQuery, InsertOriginBlockPartiesQuery, SelectPreviousOriginBlockPartiesQuery } from './originblockparties'
import { UpsertPublicKeysQuery } from './publickeys'
import { XyoBoundWitness, XyoHumanHeuristicResolver, XyoObjectSchema } from '@xyo-network/sdk-core-nodejs';
import { XyoIterableStructure } from '@xyo-network/object-model';

export class CreateOriginBlockPartiesQuery extends SqlQuery {

  constructor(sql: SqlService) {
     // this is a meta query, so no sql)
    super(sql, '')
  }

  public async send(
    { originBlock,
      originBlockId,
      publicKeyGroupIds
    }: {
      originBlock: XyoBoundWitness,
      originBlockId: number,
      publicKeyGroupIds: number[]
    }
  ): Promise<number[]> {
    try {
      const insertIds: number[] = []
      const numberOfParties = originBlock.getNumberOfParties() || 0

      for (let i = 0; i < numberOfParties; i++) {
        const fetter = originBlock.getFetterOfParty(i)

        if (fetter) {
          const index = this.getIndexFromFetter(fetter) || 0
          const hashSet = this.getFirstFetterItem(fetter, XyoObjectSchema.BRIDGE_HASH_SET.id)
          const nextPublicKey = this.getFirstFetterItem(fetter, XyoObjectSchema.NEXT_PUBLIC_KEY.id)
          const previousHash = this.getFirstFetterItem(fetter, XyoObjectSchema.PREVIOUS_HASH.id)
          const publicKeys = this.getFirstFetterItem(fetter, XyoObjectSchema.KEY_SET.id)

          const previousOriginBlockPartyId = await new SelectPreviousOriginBlockPartiesQuery(this.sql).send({
            publicKeys: publicKeys && this.encodePublicKeysToSqlString(publicKeys) || [],
            blockIndex: index - 1,
            previousHash: previousHash && previousHash.toString('base64')
          })

          let nextPublicKeyId: number | undefined
          if (nextPublicKey) {
            nextPublicKeyId = await new UpsertPublicKeysQuery(this.sql).send(
              {
                key: nextPublicKey && nextPublicKey.toString('base64'),
                publicKeyGroupId: publicKeyGroupIds[i]
              }
            )
          }

          await new SelectAllOriginBlockPartyIdsQuery(this.sql).send()

          const insertId = await new InsertOriginBlockPartiesQuery(this.sql).send(
            {
              originBlockId,
              nextPublicKeyId,
              previousOriginBlockPartyId,
              previousOriginBlockHash: previousHash && previousHash.toString('base64'),
              positionalIndex: i,
              blockIndex: index,
              bridgeHashSet: hashSet && hashSet.toString('base64'),
              payloadBytes: originBlock.getValue().getContentsCopy()
            }
          )

          insertIds.push(insertId)
        }
      }

      this.logInfo(`Succeeded in creating origin block parties with ids ${insertIds.join(', ')}`)
      return insertIds
    } catch (err) {
      this.logError(`Failed to create origin block parties ${err}`)
      throw err
    }
  }

  private encodePublicKeysToSqlString (publicKeys: Buffer): string[] {
    const stringPublicKeys: string[] = []
    const publicKeysStructure = new XyoIterableStructure(publicKeys)
    const publicKeyIt = publicKeysStructure.newIterator()

    while (publicKeyIt.hasNext()) {
      stringPublicKeys.push(publicKeyIt.next().value.getAll().getContentsCopy().toString('base64'))
    }

    return stringPublicKeys
  }

  // todo think about moving these into a utils function
  private getIndexFromFetter (fetter: XyoIterableStructure): number | undefined {
    const indexes = fetter.getId(XyoObjectSchema.INDEX.id)

    if (indexes.length < 1) {
      return
    }

    const numberInBytes = indexes[0].getValue()
    return
  }

  private getFirstFetterItem (fetter: XyoIterableStructure, id: number): Buffer | undefined {
    const hashSets = fetter.getId(id)

    if (hashSets.length < 1) {
      return
    }

    return hashSets[0].getAll().getContentsCopy()
  }
}
