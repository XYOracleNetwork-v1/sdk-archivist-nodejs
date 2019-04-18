/*
 * File: insert.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:00 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Thursday, 18th April 2019 9:48:32 am
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { SqlQuery } from "../query"
import { SqlService } from "../../sql-service"
import { IXyoSerializationService } from "@xyo-network/serialization"
import _ from 'lodash'
import { IXyoSignature } from "@xyo-network/signing"

export class InsertKeySignaturesQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, `
      INSERT INTO KeySignatures(
        publicKeyId,
        originBlockPartyId,
        signature,
        positionalIndex
      )
      VALUES(?, ?, ?, ?)
    `,
    serialization)
  }

  public async send(
    { publicKeyIds,
      originBlockPartyId,
      signatures}: {publicKeyIds: number[],
        originBlockPartyId: number,
        signatures: IXyoSignature[]}
  ): Promise<number[]> {
    return publicKeyIds.reduce(async (promiseChain, publicKeyId, currentIndex) => {
      const ids = await promiseChain
      const insertId = (await this.sql.query<{insertId: number}>(
        this.query, [
        publicKeyId,
        originBlockPartyId,
        this.serialization.serialize(signatures[currentIndex], 'hex') as string,
        currentIndex
      ])).insertId
      ids.push(insertId)
      return ids
    }, Promise.resolve([]) as Promise<number[]>)
  }
}
