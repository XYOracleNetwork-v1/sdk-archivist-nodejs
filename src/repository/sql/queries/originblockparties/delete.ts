/*
 * File: delete.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:00 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Thursday, 18th April 2019 9:48:41 am
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { SqlQuery } from '../query'
import { SqlService } from '../../sql-service'
import { IXyoSerializationService } from '@xyo-network/serialization'
import _ from 'lodash'

export class DeleteOriginBlockPartiesQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, `
      DELETE obp FROM OriginBlockParties obp
        JOIN OriginBlocks ob on ob.id = obp.originBlockId
      WHERE ob.signedHash = ?;
    `,
          serialization)
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
