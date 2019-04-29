/*
 * File: select.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:00 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Sunday, 21st April 2019 1:54:50 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { SqlQuery } from '../query'
import { SqlService } from '../../sql-service'
import _ from 'lodash'
import { CountOriginBlocksQuery } from './count'
import { XyoBuffer } from '@xyo-network/object-model'
import { XyoBoundWitness } from '@xyo-network/sdk-core-nodejs'

export class SelectOriginBlocksQuery extends SqlQuery {

  constructor(sql: SqlService) {
    super(
      sql,
      `SELECT
        ob.bytes as bytes
      FROM OriginBlocks ob
      ORDER BY ob.id
      LIMIT ?
      `)
  }

  public async send({ limit }: {limit: number}): Promise<any> {
    const originBlockQuery = this.sql.query<Array<{bytes: Buffer}>>(
      this.query, [limit + 1])

    const [originBlockResults, totalSize] =
      await Promise.all([originBlockQuery, new CountOriginBlocksQuery(this.sql).send()])

    const hasNextPage = originBlockResults.length === (limit + 1)

    if (hasNextPage) {
      originBlockResults.pop()
    }

    const list = _.chain(originBlockResults)
      .map(result => 
        new XyoBoundWitness(new XyoBuffer(result.bytes))
      )
      .value()

    return {
      list,
      hasNextPage,
      totalSize
    }
  }
}
