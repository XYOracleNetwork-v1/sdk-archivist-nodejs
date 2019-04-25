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
import _ from 'lodash'
import { XyoBoundWitness } from '@xyo-network/sdk-core-nodejs';
import { XyoBuffer } from '@xyo-network/object-model';

export class BlocksTheProviderAttributionQuery extends SqlQuery {

  constructor(sql: SqlService) {
    super(sql, `
      SELECT
        ob.bytes as bytes,
        ob.signedHash as originBlockHash
      FROM OriginBlockAttributions oba
        JOIN OriginBlocks ob on ob.signedHash = oba.sourceSignedHash
      WHERE oba.providesAttributionForSignedHash = ?;
    `)
  }

  public async send({ hash }: {hash: Buffer}): Promise<any> {
    const results = await this.sql.query<Array<{bytes: Buffer, originBlockHash: string}>>(
      this.query, [hash.toString('hex')])

    return results.reduce((memo: {[h: string]: XyoBoundWitness}, result) => {
      memo[result.originBlockHash] = new XyoBoundWitness(new XyoBuffer(result.bytes))
      return memo
    },                    {})
  }
}
