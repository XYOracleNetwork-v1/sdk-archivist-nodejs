/*
 * File: selectbyhash.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:00 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Thursday, 18th April 2019 9:48:19 am
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { SqlQuery } from '../query'
import { SqlService } from '../../sql-service'
import _ from 'lodash'
import { XyoBuffer } from '@xyo-network/object-model'
import { XyoBoundWitness } from '@xyo-network/sdk-core-nodejs'

export class SelectOriginBlocksByHashQuery extends SqlQuery {

  constructor(sql: SqlService) {
    super(sql, `
      SELECT ob.bytes as bytes
      FROM OriginBlocks ob
      WHERE signedHash = ?
      LIMIT 1;
    `)
  }

  public async send({ hash }: {hash: Buffer}): Promise<any> {
    const result = await this.sql.query<Array<{bytes: Buffer}>>(
      this.query, [hash.toString('hex')])

    return _.chain(result)
      .map(item => new XyoBoundWitness(new XyoBuffer(item.bytes)))
      .first()
      .value()
  }
}
