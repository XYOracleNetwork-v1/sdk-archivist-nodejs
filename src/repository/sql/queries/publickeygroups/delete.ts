/*
 * File: delete.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:00 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Thursday, 18th April 2019 9:49:17 am
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { SqlQuery } from '../query'
import { SqlService } from '../../sql-service'
import _ from 'lodash'

export class DeletePublicKeyGroupQuery extends SqlQuery {

  constructor(sql: SqlService) {
    super(sql, `
      DELETE FROM PublicKeyGroups WHERE id = ?
    `)
  }

  public async send(
    { publicKeyGroupId }: {publicKeyGroupId: number}
  ) {
    return this.sql.query(
      this.query,
      [publicKeyGroupId]
    )
  }
}
