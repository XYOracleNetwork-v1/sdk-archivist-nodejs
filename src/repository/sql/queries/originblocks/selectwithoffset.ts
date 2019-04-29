/*
 * File: selectwithoffset.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:00 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Thursday, 18th April 2019 9:49:03 am
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { SqlQuery } from '../query'
import { SqlService } from '../../sql-service'
import { XyoBoundWitness } from '@xyo-network/sdk-core-nodejs'
import _ from 'lodash'
import { CountOriginBlocksQuery } from './count'
import { XyoBuffer } from '@xyo-network/object-model';

export class SelectOriginBlocksWithOffsetQuery extends SqlQuery {

  constructor(sql: SqlService) {
    super(sql, `
      SELECT
        ob.bytes as bytes
      FROM OriginBlocks ob
        JOIN OriginBlocks ob2 on ob2.signedHash = ?
      WHERE ob.id > ob2.id
      ORDER BY ob.id
      LIMIT ?
    `)
  }

  public async send({ limit, offsetHash }: {limit: number, offsetHash: Buffer}): Promise<any> {
    const originBlockQuery = this.sql.query<Array<{bytes: Buffer}>>(
      this.query, [offsetHash.toString('hex'), limit + 1])

    const [originBlockResults, totalSize] =
      await Promise.all([originBlockQuery, new CountOriginBlocksQuery(this.sql).send()])

    const hasNextPage = originBlockResults.length === (limit + 1)

    if (hasNextPage) {
      originBlockResults.pop()
    }

    const list = _.chain(originBlockResults)
      .map(result => new XyoBoundWitness(new XyoBuffer(result.bytes)))
      .value()

    return {
      list,
      hasNextPage,
      totalSize
    }
  }
}
