/*
 * File: unlink.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:00 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Thursday, 18th April 2019 9:48:52 am
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { SqlQuery } from '../query'
import { SqlService } from '../../sql-service'
import _ from 'lodash'

export class UnlinkOriginBlockPartiesQuery extends SqlQuery {

  constructor(sql: SqlService) {
    super(sql, `
      UPDATE OriginBlockParties obp2
      JOIN OriginBlockParties obp on obp.id = obp2.previousOriginBlockPartyId
      JOIN OriginBlocks ob on ob.id = obp.originBlockId
      SET obp2.previousOriginBlockPartyId = NULL
      WHERE ob.signedHash = ?;
    `)
  }

  public async send(
    { hash }: {hash: string}
  ) {
    return this.sql.query(
      this.query,
      [hash]
    )
  }
}
