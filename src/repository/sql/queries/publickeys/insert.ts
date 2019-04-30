/*
 * File: insert.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:00 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Thursday, 18th April 2019 9:49:28 am
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { SqlQuery } from '../query'
import { SqlService } from '../../sql-service'
import _ from 'lodash'

export class InsertPublicKeysQuery extends SqlQuery {

  constructor(sql: SqlService) {
    super(sql, `
      INSERT INTO PublicKeys(\`key\`, publicKeyGroupId)
      VALUES(?, ?)
    `)
  }

  public async send(
    { hexKey, publicKeyGroupId }: { hexKey: string, publicKeyGroupId: number }
  ) {
    return (await this.sql.query<{insertId: number}>(
      this.query,
      [hexKey, publicKeyGroupId]
    )).insertId
  }
}
