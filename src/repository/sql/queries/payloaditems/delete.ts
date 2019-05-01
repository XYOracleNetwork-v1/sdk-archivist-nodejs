/*
 * File: delete.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:00 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Tuesday, 30th April 2019 9:32:03 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { SqlQuery } from '../query'
import { SqlService } from '../../sql-service'
import _ from 'lodash'

export class DeletePayloadItemsQuery extends SqlQuery {

  constructor(sql: SqlService) {
    super(sql, `
      DELETE p FROM PayloadItems p
        JOIN OriginBlockParties obp on obp.id = p.originBlockPartyId
        JOIN OriginBlocks ob on ob.id = obp.originBlockId
      WHERE ob.signedHash = ?;
    `)
  }

  public async send(
    { hash }:
    { hash: string }
  ) {
    return this.sql.query(
      this.query, [
        hash,
      ])
  }
}
