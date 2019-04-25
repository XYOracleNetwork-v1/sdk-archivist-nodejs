/*
 * File: insert.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:00 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Sunday, 21st April 2019 2:01:25 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { SqlQuery } from '../query'
import { SqlService } from '../../sql-service'
import _ from 'lodash'

export class InsertKeySignaturesQuery extends SqlQuery {

  constructor(sql: SqlService) {
    super(sql, `
      INSERT INTO KeySignatures(
        publicKeyId,
        originBlockPartyId,
        signature,
        positionalIndex
      )
      VALUES(?, ?, ?, ?)
    `)
  }

  public async send(
    { publicKeyIds,
      originBlockPartyId,
      signatures}: {
        publicKeyIds: number[],
        originBlockPartyId: number,
        signatures: Buffer[]
      }
  ): Promise<number[]> {
    return publicKeyIds.reduce(async (promiseChain, publicKeyId, currentIndex) => {
      const ids = await promiseChain
      const insertId = (await this.sql.query<{insertId: number}>(
        this.query, [
        publicKeyId,
        originBlockPartyId,
        signatures[currentIndex],
        currentIndex
      ])).insertId
      ids.push(insertId)
      return ids
    },                         Promise.resolve([]) as Promise<number[]>)
  }
}
