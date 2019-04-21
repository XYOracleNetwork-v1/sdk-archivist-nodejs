/*
 * File: selectall.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:00 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Thursday, 18th April 2019 9:48:46 am
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { SqlQuery } from '../query'
import { SqlService } from '../../sql-service'
import { IXyoSerializationService } from '@xyo-network/serialization'
import _ from 'lodash'

export class SelectAllOriginBlockPartyIdsQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, `
      SELECT
        obp.id
      FROM OriginBlockParties obp
      `,
          serialization)
  }

  public async send(): Promise<string[]> {
    return this.sql.query(this.query)
  }
}
