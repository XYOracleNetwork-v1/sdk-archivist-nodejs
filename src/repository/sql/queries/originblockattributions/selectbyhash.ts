/*
 * File: selectbyhash.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:00 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Thursday, 18th April 2019 9:48:37 am
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { SqlQuery } from '../query'
import { SqlService } from '../../sql-service'
import { IXyoSerializationService } from '@xyo-network/serialization'
import _ from 'lodash'
import { IXyoBoundWitness } from '@xyo-network/bound-witness'

export class BlocksTheProviderAttributionQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, `
      SELECT
        ob.bytes as bytes,
        ob.signedHash as originBlockHash
      FROM OriginBlockAttributions oba
        JOIN OriginBlocks ob on ob.signedHash = oba.sourceSignedHash
      WHERE oba.providesAttributionForSignedHash = ?;
    `,
          serialization)
  }

  public async send({ hash }: {hash: Buffer}): Promise<any> {
    const results = await this.sql.query<Array<{bytes: Buffer, originBlockHash: string}>>(
      this.query, [hash.toString('hex')])

    return results.reduce((memo: {[h: string]: IXyoBoundWitness}, result) => {
      memo[result.originBlockHash] = this.serialization.deserialize(result.bytes).hydrate()
      return memo
    },                    {})
  }
}
